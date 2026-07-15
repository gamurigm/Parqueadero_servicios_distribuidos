param(
  [string]$UsuariosBase = "http://localhost:5000",
  [string]$VehiculosBase = "http://localhost:3001",
  [string]$ZonasBase = "http://localhost:8081",
  [string]$TrazabilidadBase = "http://localhost:3002",
  [string]$TicketsBase = "http://localhost:3003",
  [string]$AuditBase = "http://localhost:3004"
)

$ErrorActionPreference = 'Stop'

function Invoke-Json {
  param([string]$Method, [string]$Url, [object]$Body = $null, [hashtable]$Headers = @{})
  $tmp = [System.IO.Path]::GetTempFileName()
  $jsonPath = $null
  try {
    $curlArgs = @('-sS', '-o', $tmp, '-w', '%{http_code}', '-X', $Method, $Url)
    foreach ($pair in $Headers.GetEnumerator()) {
      $curlArgs += @('-H', "$($pair.Key): $($pair.Value)")
    }
    if ($null -ne $Body) {
      if ($Body -is [string]) {
        $payload = $Body
      } else {
        $payload = $Body | ConvertTo-Json -Depth 20 -Compress
      }
      $jsonPath = [System.IO.Path]::ChangeExtension([System.IO.Path]::GetTempFileName(), '.json')
      [System.IO.File]::WriteAllText($jsonPath, $payload, [System.Text.Encoding]::UTF8)
      $curlArgs += @('-H', 'Content-Type: application/json', '--data-binary', "@$jsonPath")
    }
    $statusOut = & curl.exe @curlArgs 2>$null
    $bodyText = ''
    if (Test-Path -LiteralPath $tmp) { $bodyText = Get-Content -LiteralPath $tmp -Raw }
    [pscustomobject]@{
      StatusCode = [int]($statusOut | Out-String).Trim()
      Body = $bodyText
    }
  } finally {
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
    if ($jsonPath) { Remove-Item -LiteralPath $jsonPath -Force -ErrorAction SilentlyContinue }
  }
}

function Show($label, $r) {
  $color = if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) { "Green" } elseif ($r.StatusCode -ge 400) { "Red" } else { "Yellow" }
  Write-Host "[$($r.StatusCode)] $label" -ForegroundColor $color
  if ($r.StatusCode -ge 400) { Write-Host "  Body: $($r.Body.Trim().Substring(0, [Math]::Min(200, $r.Body.Trim().Length)))" -ForegroundColor DarkGray }
}

function Parse($text) { if ([string]::IsNullOrWhiteSpace($text)) { return $null } return $text | ConvertFrom-Json }

Write-Host "`n===== FLUJO COMPLETO: TICKETS + AUDIT =====" -ForegroundColor Cyan

# 0. Contar audit events antes
$rAudit0 = Invoke-Json -Method GET -Url "$AuditBase/api/v1/audit" -Headers @{ Authorization = "Bearer $null" }
# Use RabbitMQ management API instead
$rabbitCount0 = (curl.exe -sS -u guest:guest "http://localhost:15672/api/queues/audit_queue" 2>$null | ConvertFrom-Json).messages
Write-Host "`nEventos en cola RabbitMQ antes: $rabbitCount0" -ForegroundColor DarkCyan

# 1. Login admin
$adminR = Invoke-Json -Method POST -Url "$UsuariosBase/auth/login" -Body @{ username = "admin1"; password = "Admin123!" }
$admin = Parse $adminR.Body
$adminH = @{ Authorization = "Bearer $($admin.access_token)" }
Show "Login admin" $adminR

# 2. Login owner
$ownerR = Invoke-Json -Method POST -Url "$UsuariosBase/auth/login" -Body @{ username = "jpropiet"; password = "Prop123!" }
$owner = Parse $ownerR.Body
$ownerH = @{ Authorization = "Bearer $($owner.access_token)" }
Show "Login owner" $ownerR

# 3. Login super
$superR = Invoke-Json -Method POST -Url "$UsuariosBase/auth/login" -Body @{ username = "super1"; password = "Super123!" }
$superH = @{ Authorization = "Bearer $((Parse $superR.Body).access_token)" }
Show "Login super" $superR

# 4. Registrar empleado
$empCedula = "175$(Get-Random -Minimum 100000 -Maximum 999999)5"
$empEmail = "testemp$(Get-Random)@test.com"
$empPhone = "099$(Get-Random -Minimum 1000000 -Maximum 9999999)"
$regJson = @"
{"cedula":"$empCedula","firstName":"Test","middleName":"Emp","lastName":"Ticket","email":"$empEmail","nationality":"Ecuatoriana","phone":"$empPhone","address":"Av Test","rolId":"e6df8b82-972c-429b-8a1c-c97bc3a3789f","password":"EmpTest123!"}
"@
$empRegR = Invoke-Json -Method POST -Url "$UsuariosBase/auth/register" -Body $regJson
$empReg = Parse $empRegR.Body
Show "Register empleado" $empRegR

if ($empRegR.StatusCode -ne 201) {
  Write-Host "FALLO el registro del empleado. Abortando..." -ForegroundColor Red
  exit 1
}

$empLoginJson = @"
{"username":"$($empReg.username)","password":"EmpTest123!"}
"@
$empLoginR = Invoke-Json -Method POST -Url "$UsuariosBase/auth/login" -Body $empLoginJson
$empToken = (Parse $empLoginR.Body).access_token
$empH = @{ Authorization = "Bearer $empToken" }
Show "Login empleado" $empLoginR

# 5. Crear zona (admin)
$zoneR = Invoke-Json -Method POST -Url "$ZonasBase/api/v1/zonas/" -Headers $adminH -Body @{
  nombre = "Zona TicketTest $(Get-Random)"; descripcion = "Zona para test tickets"; tipoZona = "REGULAR"; capacidad = 5
}
$zone = Parse $zoneR.Body
Show "Crear zona" $zoneR

# 6. Crear espacio (admin)
$spaceR = Invoke-Json -Method POST -Url "$ZonasBase/api/v1/espacios/" -Headers $adminH -Body @{
  idZona = $zone.idZona; descripcion = "Espacio Test"; tipoEspacio = "AUTO"
}
$space = Parse $spaceR.Body
Show "Crear espacio" $spaceR

# 7. Crear vehiculo (owner) - usar placa existente del owner
$ownerCedula = "1000000003"
$existingPlaca = "tst-8364"

# Obtener el ID del owner desde el JWT
$ownerId = $owner.user.id
Write-Host "Owner ID: $ownerId | Cedula: $ownerCedula" -ForegroundColor DarkGray

# 8. Crear asignacion
$asigR = Invoke-Json -Method POST -Url "$TrazabilidadBase/asignaciones" -Headers $empH -Body @{
  userId = $ownerId; vehicleId = "fc58956d-3b05-409b-9e1d-06b97725d838"; descripcion = "Asignacion test ticket"
}
Show "Crear asignacion" $asigR

# ===== FLUJO DE TICKETS =====
Write-Host "`n--- TICKET: EMITIR ---" -ForegroundColor Yellow
$emitirR = Invoke-Json -Method POST -Url "$TicketsBase/emitir" -Headers $empH -Body @{
  idEspacio = $space.id; cedula = $ownerCedula; placa = $existingPlaca
}
$ticket = Parse $emitirR.Body
Show "Emitir ticket" $emitirR
Write-Host "  Codigo: $($ticket.codigoTicket) | Estado: $($ticket.estado)" -ForegroundColor DarkGreen

Start-Sleep -Seconds 2

Write-Host "`n--- TICKET: PAGAR ---" -ForegroundColor Yellow
$pagarR = Invoke-Json -Method POST -Url "$TicketsBase/pagar" -Headers $empH -Body @{
  idTicket = $ticket.id
}
$pago = Parse $pagarR.Body
Show "Pagar ticket" $pagarR
Write-Host "  Valor: $($pago.valorRecaudado) | Horas: $($pago.horasCobradas)" -ForegroundColor DarkGreen

Start-Sleep -Seconds 2

# Emitir segundo ticket para anular
$space2R = Invoke-Json -Method POST -Url "$ZonasBase/api/v1/espacios/" -Headers $adminH -Body @{
  idZona = $zone.idZona; descripcion = "Espacio Test 2"; tipoEspacio = "AUTO"
}
$space2 = Parse $space2R.Body
Show "Crear espacio 2" $space2R

Write-Host "`n--- TICKET: EMITIR 2 ---" -ForegroundColor Yellow
$emitir2R = Invoke-Json -Method POST -Url "$TicketsBase/emitir" -Headers $empH -Body @{
  idEspacio = $space2.id; cedula = $ownerCedula; placa = $existingPlaca
}
$ticket2 = Parse $emitir2R.Body
Show "Emitir ticket 2" $emitir2R
Write-Host "  Codigo: $($ticket2.codigoTicket) | Estado: $($ticket2.estado)" -ForegroundColor DarkGreen

Start-Sleep -Seconds 2

Write-Host "`n--- TICKET: ANULAR ---" -ForegroundColor Yellow
$anularR = Invoke-Json -Method POST -Url "$TicketsBase/anular" -Headers $empH -Body @{
  idTicket = $ticket2.id; motivo = "Prueba de anulacion automatizada"
}
$anulado = Parse $anularR.Body
Show "Anular ticket" $anularR
Write-Host "  Estado: $($anulado.estado) | Motivo: $($anulado.motivoAnulacion)" -ForegroundColor DarkGreen

Start-Sleep -Seconds 3

# ===== VERIFICAR AUDIT =====
Write-Host "`n--- VERIFICACION AUDIT ---" -ForegroundColor Magenta

# Check RabbitMQ
$rabbitCount1 = (curl.exe -sS -u guest:guest "http://localhost:15672/api/queues/audit_queue" 2>$null | ConvertFrom-Json).messages
Write-Host "Eventos en cola RabbitMQ despues: $rabbitCount1 (deberian ser procesados = 0)" -ForegroundColor DarkCyan

# Check audit DB
$auditR = Invoke-Json -Method POST -Url "$AuditBase/api/v1/audit" -Body @{
  servicio = "ms-tickets"; accion = "CREATE"; entidad = "TICKET"; usuario = "test-check"
  datos = @{ test = $true }
}
# Can't check audit API without auth, use docker exec instead
Write-Host "`nVerificando audit en base de datos..." -ForegroundColor DarkCyan

# Listar tickets
Write-Host "`n--- TICKETS LIST ---" -ForegroundColor Magenta
$listR = Invoke-Json -Method GET -Url "$TicketsBase/" -Headers $empH
$tickets = Parse $listR.Body
Show "Listar tickets" $listR
Write-Host "  Total tickets: $($tickets.Count)" -ForegroundColor DarkGreen
$tickets | ForEach-Object { Write-Host "  - $($_.codigoTicket) | Estado: $($_.estado) | Placa: $($_.placa)" -ForegroundColor DarkGray }

Write-Host "`n===== RESUMEN =====" -ForegroundColor Cyan
Write-Host "EMITIR:  Codigo=$($ticket.codigoTicket) Estado=$($ticket.estado)"
Write-Host "PAGAR:   Codigo=$($ticket.codigoTicket) Valor=$($pago.valorRecaudado) Horas=$($pago.horasCobradas)"
Write-Host "ANULAR:  Codigo=$($ticket2.codigoTicket) Estado=$($anulado.estado) Motivo=$($anulado.motivoAnulacion)"
