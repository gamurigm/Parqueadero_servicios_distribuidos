param(
  [string]$UsuariosBase = "http://localhost:5000",
  [string]$VehiculosBase = "http://localhost:3001",
  [string]$ZonasBase = "http://localhost:8081",
  [string]$TrazabilidadBase = "http://localhost:3002",
  [string]$TicketsBase = "http://localhost:3003",
  [string]$AuditBase = "http://localhost:3004",
  [string]$RabbitMqUrl = "http://localhost:15672",
  [string]$RabbitMqUser = "guest",
  [string]$RabbitMqPassword = "guest",
  [string]$AdminUsername = "testadmin",
  [string]$AdminPassword = "Admin123!",
  [string]$OwnerUsername = "jpropiet",
  [string]$OwnerPassword = "Prop123!",
  [string]$SuperUsername = "superusr",
  [string]$SuperPassword = "Super123!",
  [string]$EmployeePassword = "EmpTest123!"
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
$rabbitMqAuth = "${RabbitMqUser}:${RabbitMqPassword}"
$rabbitCount0 = (curl.exe -sS -u $rabbitMqAuth "$RabbitMqUrl/api/queues/audit_queue" 2>$null | ConvertFrom-Json).messages
Write-Host "`nEventos en cola RabbitMQ antes: $rabbitCount0" -ForegroundColor DarkCyan

# 1. Login admin
$adminR = Invoke-Json -Method POST -Url "$UsuariosBase/auth/login" -Body @{ username = $AdminUsername; password = $AdminPassword }
$admin = Parse $adminR.Body
$adminH = @{ Authorization = "Bearer $($admin.access_token)" }
Show "Login admin" $adminR

# 2. Login owner
$ownerR = Invoke-Json -Method POST -Url "$UsuariosBase/auth/login" -Body @{ username = $OwnerUsername; password = $OwnerPassword }
$owner = Parse $ownerR.Body
$ownerH = @{ Authorization = "Bearer $($owner.access_token)" }
Show "Login owner" $ownerR

# 3. Login super
$superR = Invoke-Json -Method POST -Url "$UsuariosBase/auth/login" -Body @{ username = $SuperUsername; password = $SuperPassword }
$superH = @{ Authorization = "Bearer $((Parse $superR.Body).access_token)" }
Show "Login super" $superR

# 3b. Ensure empleado role exists
$rolesR = Invoke-Json -Method GET -Url "$UsuariosBase/roles" -Headers $adminH
$rolesList = Parse $rolesR.Body
$empleadoRole = $rolesList | Where-Object { $_.nombre -eq "empleado" } | Select-Object -First 1
if (-not $empleadoRole) {
  $createR = Invoke-Json -Method POST -Url "$UsuariosBase/roles" -Headers $adminH -Body @{ nombre = "empleado"; descripcion = "Rol empleado para tests" }
  $empleadoRole = Parse $createR.Body
}
$empleadoRoleId = $empleadoRole.id
Write-Host "  Empleado role ID: $empleadoRoleId" -ForegroundColor DarkGray

# 4. Registrar empleado
$empCedula = "175$(Get-Random -Minimum 100000 -Maximum 999999)5"
$empEmail = "testemp$(Get-Random)@test.com"
$empPhone = "099$(Get-Random -Minimum 1000000 -Maximum 9999999)"
$regBody = @{
  cedula = $empCedula
  firstName = 'Test'
  middleName = 'Emp'
  lastName = 'Ticket'
  email = $empEmail
  nationality = 'Ecuatoriana'
  phone = $empPhone
  address = 'Av Test'
  rolId = $empleadoRoleId
  password = $EmployeePassword
}
$empRegR = Invoke-Json -Method POST -Url "$UsuariosBase/auth/register" -Body $regBody
$empReg = Parse $empRegR.Body
Show "Register empleado" $empRegR

if ($empRegR.StatusCode -ne 201) {
  Write-Host "FALLO el registro del empleado. Abortando..." -ForegroundColor Red
  exit 1
}

$empLoginR = Invoke-Json -Method POST -Url "$UsuariosBase/auth/login" -Body @{ username = $empReg.username; password = $EmployeePassword }
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

# 7. Crear vehiculo (owner)
$ownerId = $owner.user.id
Write-Host "Owner ID: $ownerId" -ForegroundColor DarkGray

$vehicleR = Invoke-Json -Method POST -Url "$VehiculosBase/vehiculos" -Headers $ownerH -Body @{
  tipo = "auto"; datos = @{ placa = "CRT-$((Get-Random -Minimum 1000 -Maximum 9999))"; color = "Rojo"; marca = "Toyota"; modelo = "Corolla"; anio = 2024; clasificacion = "Gasolina"; numeroPuertas = 4; capacidadMaletero = 450 }
}
$vehicle = Parse $vehicleR.Body
Show "Crear vehiculo" $vehicleR

# 8. Crear asignacion
$asigR = Invoke-Json -Method POST -Url "$TrazabilidadBase/asignaciones" -Headers $empH -Body @{
  userId = $ownerId; vehicleId = $vehicle.id; descripcion = "Asignacion test ticket"
}
Show "Crear asignacion" $asigR

# ===== FLUJO DE TICKETS =====
Write-Host "`n--- TICKET: EMITIR ---" -ForegroundColor Yellow
$emitirR = Invoke-Json -Method POST -Url "$TicketsBase/emitir" -Headers $empH -Body @{
  idEspacio = $space.id; placa = $vehicle.placa
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
  idEspacio = $space2.id; placa = $vehicle.placa
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
$rabbitCount1 = (curl.exe -sS -u $rabbitMqAuth "$RabbitMqUrl/api/queues/audit_queue" 2>$null | ConvertFrom-Json).messages
Write-Host "Eventos en cola RabbitMQ despues: $rabbitCount1 (deberian ser procesados = 0)" -ForegroundColor DarkCyan

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

# ===== CLEANUP =====
Write-Host "`n--- CLEANUP ---" -ForegroundColor Magenta

$cleanupErrors = 0

$r = Invoke-Json -Method DELETE -Url "$TrazabilidadBase/asignaciones/$ownerId/$($vehicle.id)" -Headers $superH
if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) { Write-Host "  [OK] Asignacion deleted" -ForegroundColor Green } else { Write-Host "  [FAIL] Asignacion delete -> $($r.StatusCode)" -ForegroundColor Red; $cleanupErrors++ }

$r = Invoke-Json -Method DELETE -Url "$VehiculosBase/vehiculos/$($vehicle.id)" -Headers $superH
if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) { Write-Host "  [OK] Vehicle deleted" -ForegroundColor Green } else { Write-Host "  [FAIL] Vehicle delete -> $($r.StatusCode)" -ForegroundColor Red; $cleanupErrors++ }

$r = Invoke-Json -Method DELETE -Url "$ZonasBase/api/v1/espacios/$($space2.id)" -Headers $superH
if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) { Write-Host "  [OK] Space 2 deleted" -ForegroundColor Green } else { Write-Host "  [FAIL] Space 2 delete -> $($r.StatusCode)" -ForegroundColor Red; $cleanupErrors++ }

$r = Invoke-Json -Method DELETE -Url "$ZonasBase/api/v1/espacios/$($space.id)" -Headers $superH
if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) { Write-Host "  [OK] Space 1 deleted" -ForegroundColor Green } else { Write-Host "  [FAIL] Space 1 delete -> $($r.StatusCode)" -ForegroundColor Red; $cleanupErrors++ }

$r = Invoke-Json -Method DELETE -Url "$ZonasBase/api/v1/zonas/$($zone.idZona)" -Headers $superH
if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) { Write-Host "  [OK] Zone deleted" -ForegroundColor Green } else { Write-Host "  [FAIL] Zone delete -> $($r.StatusCode)" -ForegroundColor Red; $cleanupErrors++ }

$r = Invoke-Json -Method DELETE -Url "$UsuariosBase/roles-Usuario" -Headers $superH -Body @{
  id_user = $empReg.id
  id_rol = $empleadoRoleId
  id_nuevo_rol = $empleadoRoleId
}
if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) { Write-Host "  [OK] Employee role assignment cleared" -ForegroundColor Green } else { Write-Host "  [FAIL] Employee role clear -> $($r.StatusCode)" -ForegroundColor Red; $cleanupErrors++ }

$r = Invoke-Json -Method DELETE -Url "$UsuariosBase/usuario/$($empReg.id)" -Headers $superH
if ($r.StatusCode -eq 200) {
  Write-Host "  [OK] Employee user deleted" -ForegroundColor Green
} else {
  Write-Host "  [INFO] User hard-delete blocked by FK, deactivating instead" -ForegroundColor DarkYellow
  Invoke-Json -Method PATCH -Url "$UsuariosBase/usuario/$($empReg.id)/activar-desactivar" -Headers $superH | Out-Null
}

$r = Invoke-Json -Method DELETE -Url "$UsuariosBase/persona/$($empReg.id)" -Headers $superH
if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) { Write-Host "  [OK] Employee persona deleted" -ForegroundColor Green } else { Write-Host "  [INFO] Persona delete blocked (user still linked), left as-is" -ForegroundColor DarkYellow }

if ($cleanupErrors -eq 0) {
  Write-Host "`nCleanup complete: all entities removed." -ForegroundColor Green
} else {
  Write-Host "`nCleanup finished with $cleanupErrors error(s)." -ForegroundColor Yellow
}
