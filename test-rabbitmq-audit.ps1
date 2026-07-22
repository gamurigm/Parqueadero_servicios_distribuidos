param(
  [string]$UsuariosBase = "http://localhost:5000",
  [string]$VehiculosBase = "http://localhost:3001",
  [string]$TicketsBase = "http://localhost:3003",
  [string]$AuditBase = "http://localhost:3004"
)

$ErrorActionPreference = 'Stop'
$script:PassCount = 0
$script:FailCount = 0

function New-ShortId {
  return ([guid]::NewGuid().ToString('N').Substring(0, 8))
}

function Convert-ToJsonBody {
  param([object]$Value)
  if ($null -eq $Value) { return $null }
  if ($Value -is [string]) { return $Value }
  return ($Value | ConvertTo-Json -Depth 20 -Compress)
}

function Invoke-CurlJson {
  param(
    [string]$Method,
    [string]$Url,
    [object]$Body = $null,
    [hashtable]$Headers = @{}
  )

  $tmp = [System.IO.Path]::GetTempFileName()
  $jsonPath = $null
  try {
    $args = @('-sS', '-o', $tmp, '-w', '%{http_code}', '-X', $Method, $Url)

    foreach ($pair in $Headers.GetEnumerator()) {
      $args += @('-H', "$($pair.Key): $($pair.Value)")
    }

    if ($null -ne $Body) {
      $payload = Convert-ToJsonBody $Body
      $jsonPath = [System.IO.Path]::ChangeExtension([System.IO.Path]::GetTempFileName(), '.json')
      [System.IO.File]::WriteAllText($jsonPath, $payload, [System.Text.Encoding]::UTF8)
      $args += @('-H', 'Content-Type: application/json', '--data-binary', "@$jsonPath")
    }

    $statusOut = & curl.exe @args 2>$null
    $exitCode = $LASTEXITCODE
    $bodyText = ''
    if (Test-Path -LiteralPath $tmp) {
      $bodyText = Get-Content -LiteralPath $tmp -Raw
    }

    $statusCode = 0
    [void][int]::TryParse(($statusOut | Out-String).Trim(), [ref]$statusCode)
    if ($exitCode -ne 0) {
      $statusCode = 0
    }

    [pscustomobject]@{
      StatusCode = $statusCode
      Body       = $bodyText
      ExitCode   = $exitCode
      Method     = $Method
      Url        = $Url
    }
  } finally {
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
    if ($jsonPath) {
      Remove-Item -LiteralPath $jsonPath -Force -ErrorAction SilentlyContinue
    }
  }
}

function Assert-Status {
  param(
    [string]$Name,
    [object]$Response,
    [int[]]$Expected
  )

  if ($Expected -contains $Response.StatusCode) {
    Write-Host "[PASS] $Name -> $($Response.StatusCode)" -ForegroundColor Green
    $script:PassCount++
    return $true
  }

  Write-Host "[FAIL] $Name -> $($Response.StatusCode) expected $($Expected -join ',')" -ForegroundColor Red
  if ($Response.Body) {
    Write-Host "  $($Response.Body.Trim())" -ForegroundColor DarkGray
  }
  $script:FailCount++
  return $false
}

function Test-Request {
  param(
    [string]$Name,
    [string]$Method,
    [string]$Url,
    [int[]]$ExpectedStatus,
    [object]$Body = $null,
    [hashtable]$Headers = @{}
  )

  $response = Invoke-CurlJson -Method $Method -Url $Url -Body $Body -Headers $Headers
  Assert-Status -Name $Name -Response $response -Expected $ExpectedStatus | Out-Null
  return $response
}

function Parse-Json {
  param([string]$Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return $null }
  return $Text | ConvertFrom-Json
}

function Wait-For {
  param(
    [string]$Name,
    [string]$Url,
    [int[]]$ExpectedStatus = @(200, 401, 403)
  )

  for ($i = 0; $i -lt 30; $i++) {
    $response = Invoke-CurlJson -Method GET -Url $Url
    if ($ExpectedStatus -contains $response.StatusCode) {
      Write-Host "[PASS] $Name ready -> $($response.StatusCode)" -ForegroundColor Green
      return
    }
    Start-Sleep -Seconds 1
  }
  throw "Service not ready: $Name"
}

function Get-AuditCount {
  param(
    [hashtable]$Headers = @{}
  )
  $resp = Invoke-CurlJson -Method GET -Url "$AuditBase/api/v1/audit" -Headers $Headers
  if ($resp.StatusCode -eq 200 -and $resp.Body) {
    $parsed = Parse-Json $resp.Body
    if ($parsed.Count) { return [int]$parsed.Count }
    if ($parsed.value) { return [int]$parsed.value.Count }
  }
  return 0
}

# ============================================================
# INICIO
# ============================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  TEST: RabbitMQ Audit Event Flow" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "--- Esperando servicios ---" -ForegroundColor Yellow
Wait-For -Name 'usuarios'  -Url "$UsuariosBase/"
Wait-For -Name 'vehiculos' -Url "$VehiculosBase/vehiculos"
Wait-For -Name 'tickets'   -Url "$TicketsBase/"
Wait-For -Name 'ms-audit'  -Url "$AuditBase/api/v1/audit"

# ============================================================
# 1. LOGIN
# ============================================================
Write-Host ""
Write-Host "--- 1. Login como admin ---" -ForegroundColor Yellow
$loginResp = Test-Request -Name 'POST auth/login admin' -Method POST -Url "$UsuariosBase/auth/login" -ExpectedStatus @(200) -Body @{
  username = 'testadmin'
  password = 'Admin123!'
}
$login = Parse-Json $loginResp.Body
$token = $login.access_token
$adminHeaders = @{ Authorization = "Bearer $token" }

$macHeader = @{ Authorization = "Bearer $token"; 'x-mac-address' = 'AA:BB:CC:DD:EE:FF' }

# ============================================================
# 2. AUDIT ANTES (baseline)
# ============================================================
Write-Host ""
Write-Host "--- 2. Conteo base de audit ---" -ForegroundColor Yellow
$baselineCount = Get-AuditCount -Headers $adminHeaders
Write-Host "  Audit events actuales: $baselineCount" -ForegroundColor Gray

# ============================================================
# 3. CREAR VEHICULO -> evento RabbitMQ CREATE
# ============================================================
Write-Host ""
Write-Host "--- 3. Crear vehiculo (trigger RabbitMQ CREATE) ---" -ForegroundColor Yellow
$placa1 = "RBT-$((Get-Random -Minimum 1000 -Maximum 9999))"
$vehicleResp = Test-Request -Name "POST vehiculo $placa1" -Method POST -Url "$VehiculosBase/vehiculos" -ExpectedStatus @(201) -Headers $macHeader -Body @{
  tipo = 'auto'
  datos = @{
    placa = $placa1
    marca = 'Toyota'
    modelo = 'Corolla'
    color = 'Blanco'
    anio = 2024
    clasificacion = 'Gasolina'
    numeroPuertas = 4
    capacidadMaletero = 450
  }
}
$vehicle = Parse-Json $vehicleResp.Body
Write-Host "  Vehiculo ID: $($vehicle.id)" -ForegroundColor Gray

# ============================================================
# 4. VERIFICAR EVENTO CREATE EN AUDIT
# ============================================================
Write-Host ""
Write-Host "--- 4. Verificar evento CREATE en audit (RabbitMQ) ---" -ForegroundColor Yellow
Start-Sleep -Seconds 2
$afterCreate = Get-AuditCount -Headers $adminHeaders
$newEvents = $afterCreate - $baselineCount
Write-Host "  Audit events despues de CREATE: $afterCreate (+$newEvents)" -ForegroundColor Gray

if ($newEvents -ge 1) {
  Write-Host "[PASS] Evento CREATE llego a ms-audit via RabbitMQ" -ForegroundColor Green
  $script:PassCount++
} else {
  Write-Host "[FAIL] No se detecto evento CREATE en audit" -ForegroundColor Red
  $script:FailCount++
}

# ============================================================
# 5. ACTUALIZAR VEHICULO -> evento RabbitMQ UPDATE
# ============================================================
Write-Host ""
Write-Host "--- 5. Actualizar vehiculo (trigger RabbitMQ UPDATE) ---" -ForegroundColor Yellow
Test-Request -Name "PUT vehiculo $($vehicle.id)" -Method PUT -Url "$VehiculosBase/vehiculos/$($vehicle.id)" -ExpectedStatus @(200) -Headers $macHeader -Body @{
  tipo = 'auto'
  datos = @{
    placa = $placa1
    marca = 'Toyota'
    modelo = 'Corolla'
    color = 'Gris'
    anio = 2024
    clasificacion = 'Gasolina'
    numeroPuertas = 4
    capacidadMaletero = 460
  }
} | Out-Null

# ============================================================
# 6. VERIFICAR EVENTO UPDATE EN AUDIT
# ============================================================
Write-Host ""
Write-Host "--- 6. Verificar evento UPDATE en audit (RabbitMQ) ---" -ForegroundColor Yellow
Start-Sleep -Seconds 2
$afterUpdate = Get-AuditCount -Headers $adminHeaders
$newUpdateEvents = $afterUpdate - $afterCreate
Write-Host "  Audit events despues de UPDATE: $afterUpdate (+$newUpdateEvents)" -ForegroundColor Gray

if ($newUpdateEvents -ge 1) {
  Write-Host "[PASS] Evento UPDATE llego a ms-audit via RabbitMQ" -ForegroundColor Green
  $script:PassCount++
} else {
  Write-Host "[FAIL] No se detecto evento UPDATE en audit" -ForegroundColor Red
  $script:FailCount++
}

# ============================================================
# 7. OBTENER JWT PARA TICKETS
# ============================================================
Write-Host ""
Write-Host "--- 7. Login como empleado para tickets ---" -ForegroundColor Yellow
$loginEmpResp = Test-Request -Name 'POST auth/login employee' -Method POST -Url "$UsuariosBase/auth/login" -ExpectedStatus @(200) -Body @{
  username = 'ezona1'
  password = 'Zona123!'
}
$loginEmp = Parse-Json $loginEmpResp.Body
$empHeaders = @{ Authorization = "Bearer $($loginEmp.access_token)" }

# ============================================================
# 8. EMITIR TICKET -> evento RabbitMQ CREATE
# ============================================================
Write-Host ""
Write-Host "--- 8. Emitir ticket (trigger RabbitMQ CREATE) ---" -ForegroundColor Yellow
$ticketResp = Test-Request -Name 'POST ticket emitir' -Method POST -Url "$TicketsBase/emitir" -ExpectedStatus @(201) -Headers $empHeaders -Body @{
  idEspacio = [guid]::Empty.ToString()
  cedula = '1000000003'
  placa = $placa1
}

# ============================================================
# 9. VERIFICAR EVENTO TICKET EN AUDIT
# ============================================================
Write-Host ""
Write-Host "--- 9. Verificar evento TICKET en audit (RabbitMQ) ---" -ForegroundColor Yellow
Start-Sleep -Seconds 2
$afterTicket = Get-AuditCount -Headers $adminHeaders
$newTicketEvents = $afterTicket - $afterUpdate
Write-Host "  Audit events despues de TICKET: $afterTicket (+$newTicketEvents)" -ForegroundColor Gray

if ($newTicketEvents -ge 1) {
  Write-Host "[PASS] Evento TICKET llego a ms-audit via RabbitMQ" -ForegroundColor Green
  $script:PassCount++
} else {
  Write-Host "[WARN] Evento TICKET no detectado (puede fallar por espacio inexistente)" -ForegroundColor DarkYellow
}

# ============================================================
# 10. CONSULTAR AUDIT COMO ADMIN
# ============================================================
Write-Host ""
Write-Host "--- 10. GET audit como admin ---" -ForegroundColor Yellow
Test-Request -Name 'GET /api/v1/audit' -Method GET -Url "$AuditBase/api/v1/audit" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null

# ============================================================
# 11. CONSULTAR AUDIT POR ID
# ============================================================
Write-Host ""
Write-Host "--- 11. GET audit por ID ---" -ForegroundColor Yellow
$auditResp = Invoke-CurlJson -Method GET -Url "$AuditBase/api/v1/audit" -Headers $adminHeaders
if ($auditResp.StatusCode -eq 200) {
  $auditData = Parse-Json $auditResp.Body
  $firstId = $null
  if ($auditData.value -and $auditData.value.Count -gt 0) {
    $firstId = $auditData.value[0].id
  } elseif ($auditData.Count -gt 0) {
    $firstId = $auditData[0].id
  }
  if ($firstId) {
    Test-Request -Name "GET /api/v1/audit/$firstId" -Method GET -Url "$AuditBase/api/v1/audit/$firstId" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
  } else {
    Write-Host "[SKIP] No hay audit events para buscar por ID" -ForegroundColor DarkGray
  }
}

# ============================================================
# 12. BROKEN ACCESS CONTROL: POST audit SIN token
# ============================================================
Write-Host ""
Write-Host "--- 12. BROKEN ACCESS CONTROL: POST audit SIN auth ---" -ForegroundColor Yellow
$bacResp = Test-Request -Name 'POST /api/v1/audit SIN token (deberia fallar)' -Method POST -Url "$AuditBase/api/v1/audit" -ExpectedStatus @(401, 403) -Body @{
  servicio = 'ms-hacker'
  accion = 'DELETE'
  entidad = 'USUARIO'
  usuario = 'attacker'
}

# ============================================================
# 13. BROKEN ACCESS CONTROL: GET audit SIN token
# ============================================================
Write-Host ""
Write-Host "--- 13. BROKEN ACCESS CONTROL: GET audit SIN auth ---" -ForegroundColor Yellow
$bacGetResp = Test-Request -Name 'GET /api/v1/audit SIN token (deberia fallar)' -Method GET -Url "$AuditBase/api/v1/audit" -ExpectedStatus @(401, 403)

# ============================================================
# 14. CLEANUP: eliminar vehiculo
# ============================================================
Write-Host ""
Write-Host "--- 14. Cleanup ---" -ForegroundColor Yellow
Test-Request -Name "DELETE vehiculo $($vehicle.id)" -Method DELETE -Url "$VehiculosBase/vehiculos/$($vehicle.id)" -ExpectedStatus @(200) -Headers $macHeader | Out-Null
Start-Sleep -Seconds 2
$afterDelete = Get-AuditCount -Headers $adminHeaders
$newDeleteEvents = $afterDelete - $afterTicket
Write-Host "  Audit events despues de DELETE: $afterDelete (+$newDeleteEvents)" -ForegroundColor Gray

if ($newDeleteEvents -ge 1) {
  Write-Host "[PASS] Evento DELETE llego a ms-audit via RabbitMQ" -ForegroundColor Green
  $script:PassCount++
} else {
  Write-Host "[WARN] Evento DELETE no detectado" -ForegroundColor DarkYellow
}

# ============================================================
# RESUMEN
# ============================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN RABBITMQ AUDIT TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PASS: $PassCount" -ForegroundColor Green
Write-Host "  FAIL: $FailCount" -ForegroundColor Red
Write-Host "  TOTAL: $($PassCount + $FailCount)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

if ($FailCount -gt 0) {
  exit 1
}
