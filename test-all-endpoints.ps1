param(
  [string]$UsuariosBase    = "http://localhost:5000",
  [string]$VehiculosBase   = "http://localhost:3001",
  [string]$ZonasBase       = "http://localhost:8081",
  [string]$TrazabilidadBase= "http://localhost:3002",
  [string]$TicketsBase     = "http://localhost:3003",
  [string]$AuditBase       = "http://localhost:3004",
  [string]$AdminUsername   = "testadmin",
  [string]$AdminPassword   = "Admin123!",
  [string]$OwnerUsername   = "jpropiet",
  [string]$OwnerPassword   = "Prop123!",
  [string]$SuperUsername   = "superusr",
  [string]$SuperPassword   = "Super123!",
  [string]$ManagerUsername = "ezona1",
  [string]$ManagerPassword = "Zona123!",
  [string]$EmployeePassword= "EmpTest123!"
)

$ErrorActionPreference = 'Stop'
$script:Pass = 0
$script:Fail = 0

function New-ShortId { ([guid]::NewGuid().ToString('N').Substring(0, 8)) }

function New-Ced {
  $d = (1..6 | ForEach-Object { Get-Random -Minimum 0 -Maximum 10 }) -join ''
  $b = "175$d"
  $coef = @(2,1,2,1,2,1,2,1,2)
  $sum = 0
  for ($i=0; $i -lt 9; $i++) {
    $p = [int]::Parse($b.Substring($i,1)) * $coef[$i]
    if ($p -gt 9) { $p -= 9 }
    $sum += $p
  }
  "$b$( (10 - ($sum%10)) % 10 )"
}

function To-Json {
  param([object]$V)
  if ($null -eq $V) { return $null }
  if ($V -is [string]) { return $V }
  $V | ConvertTo-Json -Depth 20 -Compress
}

function Curl {
  param([string]$Method,[string]$Url,[object]$Body=$null,[hashtable]$Headers=@{})
  $tmp = [System.IO.Path]::GetTempFileName()
  $jp = $null
  try {
    $a = @('-sS','-o',$tmp,'-w','%{http_code}','-X',$Method,$Url)
    foreach ($h in $Headers.GetEnumerator()) { $a += @('-H',"$($h.Key): $($h.Value)") }
    if ($null -ne $Body) {
      $p = To-Json $Body
      $jp = [System.IO.Path]::ChangeExtension([System.IO.Path]::GetTempFileName(),'.json')
      [System.IO.File]::WriteAllText($jp,$p,[System.Text.Encoding]::UTF8)
      $a += @('-H','Content-Type: application/json','--data-binary',"@$jp")
    }
    $out = & curl.exe @a 2>$null
    $code = 0
    [void][int]::TryParse(($out | Out-String).Trim(), [ref]$code)
    $bod = ''
    if (Test-Path -LiteralPath $tmp) { $bod = Get-Content -LiteralPath $tmp -Raw }
    [pscustomobject]@{ StatusCode=$code; Body=$bod }
  } finally {
    Remove-Item -LiteralPath $tmp -Force -EA SilentlyContinue
    if ($jp) { Remove-Item -LiteralPath $jp -Force -EA SilentlyContinue }
  }
}

function T {
  param([string]$Name,[string]$Method,[string]$Url,[int[]]$Exp,[object]$Body=$null,[hashtable]$Headers=@{})
  $r = Curl -Method $Method -Url $Url -Body $Body -Headers $Headers
  if ($Exp -contains $r.StatusCode) {
    Write-Host "  [PASS] $Name -> $($r.StatusCode)" -ForegroundColor Green
    $script:Pass++
  } else {
    Write-Host "  [FAIL] $Name -> $($r.StatusCode) (expected $($Exp -join '|'))" -ForegroundColor Red
    if ($r.Body) { Write-Host "    $($r.Body.Trim().Substring(0,[Math]::Min(200,$r.Body.Trim().Length)))" -ForegroundColor DarkGray }
    $script:Fail++
  }
  return $r
}

function PJ { param([string]$T); if ([string]::IsNullOrWhiteSpace($T)) { return $null }; $T | ConvertFrom-Json }
function Auth { param([string]$Tok); @{ Authorization = "Bearer $Tok" } }

function Wait-Ready {
  param([string]$N,[string]$U,[int[]]$C=@(200,401,403))
  for ($i=0; $i -lt 45; $i++) {
    $r = Curl -Method GET -Url $U
    if ($C -contains $r.StatusCode) {
      Write-Host "[OK] $N ready" -ForegroundColor Green
      return
    }
    Start-Sleep -Seconds 1
  }
  throw "Service $N not ready at $U"
}

function Role-Ensure {
  param([string]$Tok,[string]$N,[string]$D)
  $h = Auth $Tok
  $list = PJ (Curl -Method GET -Url "$UsuariosBase/roles" -Headers $h).Body
  $ex = $list | Where-Object { $_.nombre -eq $N } | Select-Object -First 1
  if ($ex) { return $ex }
  $cr = Curl -Method POST -Url "$UsuariosBase/roles" -Body @{nombre=$N;descripcion=$D} -Headers $h
  if ($cr.StatusCode -eq 201) { return PJ $cr.Body }
  $list2 = PJ (Curl -Method GET -Url "$UsuariosBase/roles" -Headers $h).Body
  return $list2 | Where-Object { $_.nombre -eq $N } | Select-Object -First 1
}

function Seed-Asignacion {
  param([string]$Tok,[string]$UserId,[string]$VehicleId)
  $h = Auth $Tok
  $body = @{ usuarioId=$UserId; vehiculoId=$VehicleId }
  $r = Curl -Method POST -Url "$TrazabilidadBase/asignaciones" -Body $body -Headers $h
  if ($r.StatusCode -in @(201,409)) { return PJ $r.Body }
  return $null
}

# =========================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST ALL ENDPOINTS - COMPREHENSIVE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# --- WAIT FOR SERVICES ---
Write-Host "`n--- Waiting for services ---" -ForegroundColor DarkCyan
Wait-Ready 'usuarios'    "$UsuariosBase/"
Wait-Ready 'vehiculos'   "$VehiculosBase/vehiculos"
Wait-Ready 'trazabilidad' "$TrazabilidadBase/trazabilidad/historial"
Wait-Ready 'tickets'     "$TicketsBase/"
Wait-Ready 'zonas'       "$ZonasBase/api/v1/zonas/"
Wait-Ready 'espacios'    "$ZonasBase/api/v1/espacios/"
Wait-Ready 'audit'       "$AuditBase/api/v1/"

# --- LOGIN ---
Write-Host "`n--- Login seed users ---" -ForegroundColor DarkCyan
$adminT  = (PJ (T 'Login admin' POST "$UsuariosBase/auth/login" @(200) @{username=$AdminUsername;password=$AdminPassword}).Body).access_token
$ownerT  = (PJ (T 'Login owner' POST "$UsuariosBase/auth/login" @(200) @{username=$OwnerUsername;password=$OwnerPassword}).Body).access_token
$mgrT    = (PJ (T 'Login manager' POST "$UsuariosBase/auth/login" @(200) @{username=$ManagerUsername;password=$ManagerPassword}).Body).access_token
$superT  = (PJ (T 'Login super' POST "$UsuariosBase/auth/login" @(200) @{username=$SuperUsername;password=$SuperPassword}).Body).access_token
$aH = Auth $adminT; $oH = Auth $ownerT; $mH = Auth $mgrT; $sH = Auth $superT

# --- CREATE EMPLOYEE ---
Write-Host "`n--- Create employee ---" -ForegroundColor DarkCyan
$empRole = Role-Ensure -Tok $adminT -N 'empleado' -D 'Empleado para tests'
$empCed = New-Ced
$empReg = PJ (T 'Register employee' POST "$UsuariosBase/auth/register" @(201) @{
  cedula=$empCed; firstName='Test'; lastName='Emp'; email="emp.$(New-ShortId)@t.com"
  nationality='Ecuatoriana'; phone="099$(Get-Random -Minimum 1000000 -Maximum 9999999)"
  address='Av Test'; rolId=$empRole.id; password=$EmployeePassword
}).Body
$empT = (PJ (T 'Login employee' POST "$UsuariosBase/auth/login" @(200) @{username=$empReg.username;password=$EmployeePassword}).Body).access_token
$eH = Auth $empT

# =========================================================================
# 1. GESTION_USUARIOS (35 endpoints)
# =========================================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  1. GESTION_USUARIOS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Write-Host "`n--- Auth ---" -ForegroundColor DarkCyan
T 'GET  / (health)' GET "$UsuariosBase/" @(200)
T 'POST /auth/register (duplicate ced)' POST "$UsuariosBase/auth/register" @(409) @{
  cedula=$empCed; firstName='X'; lastName='Y'; email="x@x.com"
  nationality='E'; phone='0991234567'; address='X'; rolId=$empRole.id; password='Pass123!'
}
T 'POST /auth/refresh' POST "$UsuariosBase/auth/refresh" @(200) @{refresh_token=$empReg.refresh_token}
T 'POST /auth/logout (employee)' POST "$UsuariosBase/auth/logout" @(200) -Headers $eH
T 'GET  /auth/profile (employee re-login)' GET "$UsuariosBase/auth/profile" @(200) -Headers (Auth ((PJ (T 'Re-login emp' POST "$UsuariosBase/auth/login" @(200) @{username=$empReg.username;password=$EmployeePassword}).Body).access_token))
$empT2 = (PJ (Curl -Method POST -Url "$UsuariosBase/auth/login" -Body @{username=$empReg.username;password=$EmployeePassword}).Body).access_token
$eH = Auth $empT2
T 'POST /auth/validate-token (internal)' POST "$UsuariosBase/auth/validate-token" @(200) @{jti=(PJ $empT2).jti}

Write-Host "`n--- Roles CRUD ---" -ForegroundColor DarkCyan
$testRole = PJ (T 'POST /roles (create)' POST "$UsuariosBase/roles" @(201) @{nombre="trole_$(New-ShortId)";descripcion='Test role'} -Headers $aH).Body
T 'GET  /roles (list)' GET "$UsuariosBase/roles" @(200) -Headers $aH
T 'GET  /roles/:id' GET "$UsuariosBase/roles/$($testRole.id)" @(200) -Headers $aH
T 'PUT  /roles/:id' PUT "$UsuariosBase/roles/$($testRole.id)" @(200) @{nombre=$testRole.nombre;descripcion='Updated'} -Headers $aH
T 'PATCH /roles/:id (deactivate)' PATCH "$UsuariosBase/roles/$($testRole.id)" @(200) -Headers $aH
T 'PATCH /roles/:id (reactivate)' PATCH "$UsuariosBase/roles/$($testRole.id)" @(200) -Headers $aH
T 'POST /roles (denied for owner)' POST "$UsuariosBase/roles" @(403) @{nombre='bad';descripcion='x'} -Headers $oH

Write-Host "`n--- RolesUsuario CRUD ---" -ForegroundColor DarkCyan
$ru = PJ (T 'POST /roles-Usuario (assign)' POST "$UsuariosBase/roles-Usuario" @(201) @{
  id_usuario=$empReg.id; id_rol=$testRole.id
} -Headers $aH).Body
T 'GET  /roles-Usuario (list)' GET "$UsuariosBase/roles-Usuario" @(200) -Headers $aH
T 'GET  /roles-Usuario/asignacion' GET "$UsuariosBase/roles-Usuario/asignacion?id_usuario=$($empReg.id)&id_rol=$($testRole.id)" @(200) -Headers $aH
T 'GET  /roles-Usuario/usuarios/:id' GET "$UsuariosBase/roles-Usuario/usuarios/$($empReg.id)" @(200) -Headers $aH
T 'GET  /roles-Usuario/roles/:id' GET "$UsuariosBase/roles-Usuario/roles/$($testRole.id)" @(200) -Headers $aH
T 'PUT  /roles-Usuario' PUT "$UsuariosBase/roles-Usuario" @(200) @{
  id_usuario=$empReg.id; id_rol=$testRole.id
} -Headers $aH
T 'PATCH /roles-Usuario/activar-desactivar' PATCH "$UsuariosBase/roles-Usuario/activar-desactivar" @(200) @{
  id_usuario=$empReg.id; id_rol=$testRole.id
} -Headers $aH
T 'PATCH /roles-Usuario/activar-desactivar (restore)' PATCH "$UsuariosBase/roles-Usuario/activar-desactivar" @(200) @{
  id_usuario=$empReg.id; id_rol=$testRole.id
} -Headers $aH
T 'DELETE /roles-Usuario (clear)' DELETE "$UsuariosBase/roles-Usuario?id_usuario=$($empReg.id)&id_rol=$($testRole.id)" @(200) -Headers $sH
T 'POST /roles-Usuario (denied emp)' POST "$UsuariosBase/roles-Usuario" @(403) @{
  id_usuario=$empReg.id; id_rol=$testRole.id
} -Headers $eH

Write-Host "`n--- Persona CRUD ---" -ForegroundColor DarkCyan
$persCed = New-Ced
$persBody = @{dni=$persCed;nombre='Persona';apellido='Test';nacionalidad='Ecuatoriana';telefono='0991234567';direccion='Av Test'}
$persona = PJ (T 'POST /persona (create)' POST "$UsuariosBase/persona" @(201) $persBody -Headers $aH).Body
T 'GET  /persona (list)' GET "$UsuariosBase/persona" @(200) -Headers $aH
T 'GET  /persona/cedula/:c' GET "$UsuariosBase/persona/cedula/$persCed" @(200) -Headers $aH
T 'GET  /persona/:id' GET "$UsuariosBase/persona/$($persona.id)" @(200) -Headers $aH
T 'PUT  /persona/:id' PUT "$UsuariosBase/persona/$($persona.id)" @(200) @{nombre='Updated'} -Headers $aH
T 'PATCH /persona/:id/cambio-de-estado' PATCH "$UsuariosBase/persona/$($persona.id)/cambio-de-estado" @(200) -Headers $aH
T 'PATCH /persona/:id/cambio-de-estado (restore)' PATCH "$UsuariosBase/persona/$($persona.id)/cambio-de-estado" @(200) -Headers $aH
T 'POST /persona (denied owner)' POST "$UsuariosBase/persona" @(403) $persBody -Headers $oH

Write-Host "`n--- Usuario CRUD ---" -ForegroundColor DarkCyan
$usrCed = New-Ced
$usrBody = @{cedula=$usrCed;firstName='User';lastName='Test';email="u.$(New-ShortId)@t.com";password='User123!'}
$personaU = PJ (Curl -Method POST -Url "$UsuariosBase/persona" -Body @{dni=$usrCed;nombre='Up';apellido='Test';nacionalidad='Ecuatoriana';telefono='0991111222';direccion='X'} -Headers $aH).Body
$usuario = PJ (T 'POST /usuario (create)' POST "$UsuariosBase/usuario" @(201) @{
  cedula=$usrCed;firstName='User';lastName='Test';email="u.$(New-ShortId)@t.com";password='User123!';personaId=$personaU.id
} -Headers $aH).Body
T 'GET  /usuario (list)' GET "$UsuariosBase/usuario" @(200) -Headers $aH
T 'GET  /usuario/:id' GET "$UsuariosBase/usuario/$($usuario.id)" @(200) -Headers $aH
T 'PUT  /usuario/:id' PUT "$UsuariosBase/usuario/$($usuario.id)" @(200) @{email="u.$(New-ShortId)@t.com"} -Headers $aH
T 'PATCH /usuario/:id (password)' PATCH "$UsuariosBase/usuario/$($usuario.id)" @(200) @{newPassword='NewPass123!'} -Headers $aH
T 'PATCH /usuario/:id/activar-desactivar' PATCH "$UsuariosBase/usuario/$($usuario.id)/activar-desactivar" @(200) -Headers $aH
T 'PATCH /usuario/:id/activar-desactivar (restore)' PATCH "$UsuariosBase/usuario/$($usuario.id)/activar-desactivar" @(200) -Headers $aH
T 'POST /usuario (denied owner)' POST "$UsuariosBase/usuario" @(403) $usrBody -Headers $oH

Write-Host "`n--- Auth denials ---" -ForegroundColor DarkCyan
T 'GET  /roles (401 no token)' GET "$UsuariosBase/roles" @(401)
T 'GET  /persona (401 no token)' GET "$UsuariosBase/persona" @(401)
T 'GET  /usuario (401 no token)' GET "$UsuariosBase/usuario" @(401)

# =========================================================================
# 2. VEHICULOS (6 endpoints)
# =========================================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  2. VEHICULOS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

T 'GET  / (health)' GET "$VehiculosBase/" @(200)
$vehPlaca = "CRT-$(Get-Random -Minimum 1000 -Maximum 9999)"
$vehiculo = PJ (T 'POST /vehiculos (create)' POST "$VehiculosBase/vehiculos" @(201) @{
  placa=$vehPlaca;marca='Toyota';modelo='Corolla';anio=2024;color='Blanco'
  tipoVehiculo='AUTOMOVIL';propietarioId=($PJ (Curl -Method GET -Url "$UsuariosBase/auth/profile" -Headers $oH).Body).id
} -Headers $oH).Body
T 'GET  /vehiculos (list)' GET "$VehiculosBase/vehiculos" @(200) -Headers $oH
T 'GET  /vehiculos/:id' GET "$VehiculosBase/vehiculos/$($vehiculo.id)" @(200) -Headers $oH
T 'PUT  /vehiculos/:id' PUT "$VehiculosBase/vehiculos/$($vehiculo.id)" @(200) @{color='Negro'} -Headers $oH
T 'DELETE /vehiculos (denied owner)' DELETE "$VehiculosBase/vehiculos/$($vehiculo.id)" @(403) -Headers $oH
T 'GET  /vehiculos (401 no token)' GET "$VehiculosBase/vehiculos" @(401)

# =========================================================================
# 3. ZONAS (12 endpoints)
# =========================================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  3. ZONAS (Java)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Write-Host "`n--- Zonas ---" -ForegroundColor DarkCyan
T 'GET  /api/v1/zonas/ (public)' GET "$ZonasBase/api/v1/zonas/" @(200)
$zona = PJ (T 'POST /api/v1/zonas/ (create)' POST "$ZonasBase/api/v1/zonas/" @(201) @{
  nombre="ZonaTest$(New-ShortId)";direccion='Av Zona';capacidad=50;estado='ACTIVA'
} -Headers $mH).Body
T 'PUT  /api/v1/zonas/:id' PUT "$ZonasBase/api/v1/zonas/$($zona.idZona)" @(200) @{
  nombre=$zona.nombre;direccion='Updated';capacidad=60;estado='ACTIVA'
} -Headers $mH
T 'PATCH /api/v1/zonas/:id/activar-desactivar' PATCH "$ZonasBase/api/v1/zonas/$($zona.idZona)/activar-desactivar" @(200) -Headers $mH
T 'PATCH /api/v1/zonas/:id/activar-desactivar (restore)' PATCH "$ZonasBase/api/v1/zonas/$($zona.idZona)/activar-desactivar" @(200) -Headers $mH
T 'POST /api/v1/zonas/ (denied owner)' POST "$ZonasBase/api/v1/zonas/" @(403) @{
  nombre='Bad';direccion='X';capacidad=10;estado='ACTIVA'
} -Headers $oH

Write-Host "`n--- Espacios ---" -ForegroundColor DarkCyan
T 'GET  /api/v1/espacios/ (public)' GET "$ZonasBase/api/v1/espacios/" @(200)
$esp1 = PJ (T 'POST /api/v1/espacios/ (create 1)' POST "$ZonasBase/api/v1/espacios/" @(201) @{
  codigo="ESP-$(Get-Random -Minimum 1000 -Maximum 9999)";idZona=$zona.idZona
  tipo='AUTOMOVIL';estado='DISPONIBLE'
} -Headers $mH).Body
$esp2 = PJ (T 'POST /api/v1/espacios/ (create 2)' POST "$ZonasBase/api/v1/espacios/" @(201) @{
  codigo="ESP-$(Get-Random -Minimum 1000 -Maximum 9999)";idZona=$zona.idZona
  tipo='AUTOMOVIL';estado='DISPONIBLE'
} -Headers $mH).Body
T 'GET  /api/v1/espacios/zona/:id' GET "$ZonasBase/api/v1/espacios/zona/$($zona.idZona)" @(200) -Headers $mH
T 'PUT  /api/v1/espacios/:id' PUT "$ZonasBase/api/v1/espacios/$($esp1.idEspacio)" @(200) @{
  codigo=$esp1.codigo;idZona=$zona.idZona;tipo='CAMIONETA';estado='DISPONIBLE'
} -Headers $mH
T 'PATCH /api/v1/espacios/:id/estado' PATCH "$ZonasBase/api/v1/espacios/$($esp1.idEspacio)/estado?nuevoEstado=OCUPADO" @(200) -Headers $mH
T 'PATCH /api/v1/espacios/:id/activar-desactivar' PATCH "$ZonasBase/api/v1/espacios/$($esp1.idEspacio)/activar-desactivar" @(200) -Headers $mH
T 'PATCH /api/v1/espacios/:id/activar-desactivar (restore)' PATCH "$ZonasBase/api/v1/espacios/$($esp1.idEspacio)/activar-desactivar" @(200) -Headers $mH

# =========================================================================
# 4. TRAZABILIDAD (14 endpoints)
# =========================================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  4. TRAZABILIDAD" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Write-Host "`n--- Asignaciones ---" -ForegroundColor DarkCyan
$asig = Seed-Asignacion -Tok $empT2 -UserId ($PJ (Curl -Method GET -Url "$UsuariosBase/auth/profile" -Headers $oH).Body).id -VehicleId $vehiculo.id
T 'POST /asignaciones (create)' POST "$TrazabilidadBase/asignaciones" @(201,409) @{
  usuarioId=($PJ (Curl -Method GET -Url "$UsuariosBase/auth/profile" -Headers $oH).Body).id
  vehiculoId=$vehiculo.id
} -Headers $eH
T 'GET  /asignaciones (list)' GET "$TrazabilidadBase/asignaciones" @(200) -Headers $eH
$ownerId = ($PJ (Curl -Method GET -Url "$UsuariosBase/auth/profile" -Headers $oH).Body).id
T 'GET  /asignaciones/propietario/:id' GET "$TrazabilidadBase/asignaciones/propietario/$ownerId" @(200) -Headers $eH
T 'GET  /asignaciones/:userId/:vehicleId' GET "$TrazabilidadBase/asignaciones/$ownerId/$($vehiculo.id)" @(200) -Headers $eH
T 'PUT  /asignaciones/:userId/:vehicleId' PUT "$TrazabilidadBase/asignaciones/$ownerId/$($vehiculo.id)" @(200) @{
  activa=$true
} -Headers $eH

Write-Host "`n--- Trazabilidad ---" -ForegroundColor DarkCyan
T 'GET  /trazabilidad/historial' GET "$TrazabilidadBase/trazabilidad/historial" @(200) -Headers $aH
T 'GET  /trazabilidad/microservicio/:n' GET "$TrazabilidadBase/trazabilidad/microservicio/USUARIOS" @(200) -Headers $aH
T 'GET  /trazabilidad/propietario/:id' GET "$TrazabilidadBase/trazabilidad/propietario/$ownerId" @(200) -Headers $aH
T 'GET  /trazabilidad/:uid/:vid' GET "$TrazabilidadBase/trazabilidad/$ownerId/$($vehiculo.id)" @(200) -Headers $aH
T 'POST /trazabilidad/registrar (inter-svc)' POST "$TrazabilidadBase/trazabilidad/registrar" @(201) @{
  userId=$ownerId;vehicleId=$vehiculo.id;tipoCambio='TEST_EVENT'
  servicioOrigen='TEST';detalles='End-to-end test'
} -Headers $aH

Write-Host "`n--- Trazabilidad via asignaciones ---" -ForegroundColor DarkCyan
T 'GET  /asignaciones/trazabilidad/historial' GET "$TrazabilidadBase/asignaciones/trazabilidad/historial" @(200) -Headers $aH
T 'GET  /asignaciones/trazabilidad/propietario/:id' GET "$TrazabilidadBase/asignaciones/trazabilidad/propietario/$ownerId" @(200) -Headers $aH
T 'GET  /asignaciones/trazabilidad/:uid/:vid' GET "$TrazabilidadBase/asignaciones/trazabilidad/$ownerId/$($vehiculo.id)" @(200) -Headers $aH

Write-Host "`n--- Denials ---" -ForegroundColor DarkCyan
T 'POST /asignaciones (denied owner)' POST "$TrazabilidadBase/asignaciones" @(403) @{
  usuarioId=$ownerId;vehiculoId=$vehiculo.id
} -Headers $oH
T 'GET  /trazabilidad/historial (401)' GET "$TrazabilidadBase/trazabilidad/historial" @(401)

# =========================================================================
# 5. TICKETS (7 endpoints)
# =========================================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  5. TICKETS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Write-Host "`n--- CRUD ---" -ForegroundColor DarkCyan
$ticket1 = PJ (T 'POST /emitir (ticket 1)' POST "$TicketsBase/emitir" @(201) @{
  placa=$vehPlaca;idEspacio=$esp1.idEspacio
} -Headers $eH).Body
T 'GET  / (list)' GET "$TicketsBase/" @(200) -Headers $eH
T 'GET  /:id' GET "$TicketsBase/$($ticket1.id)" @(200) -Headers $eH
T 'GET  /codigo/:c' GET "$TicketsBase/codigo/$($ticket1.codigo)" @(200) -Headers $eH
T 'POST /pagar' POST "$TicketsBase/pagar" @(200) @{codigo=$ticket1.codigo} -Headers $eH
T 'POST /pagar (already paid - 409?)' POST "$TicketsBase/pagar" @(200,409) @{codigo=$ticket1.codigo} -Headers $eH

$ticket2 = PJ (T 'POST /emitir (ticket 2)' POST "$TicketsBase/emitir" @(201) @{
  placa=$vehPlaca;idEspacio=$esp2.idEspacio
} -Headers $eH).Body
T 'POST /anular' POST "$TicketsBase/anular" @(200) @{
  codigo=$ticket2.codigo;motivo='Test anulacion'
} -Headers $eH

Write-Host "`n--- Denials ---" -ForegroundColor DarkCyan
T 'POST /emitir (denied owner)' POST "$TicketsBase/emitir" @(403) @{placa=$vehPlaca;idEspacio=$esp1.idEspacio} -Headers $oH
T 'POST /emitir (401 no token)' POST "$TicketsBase/emitir" @(401) @{placa=$vehPlaca;idEspacio=$esp1.idEspacio}

Write-Host "`n--- SSE (public stream check) ---" -ForegroundColor DarkCyan
$sseR = Curl -Method GET -Url "$TicketsBase/sse/espacios"
T 'GET  /sse/espacios (SSE stream)' GET "$TicketsBase/sse/espacios" @(200)

# =========================================================================
# 6. MS-AUDIT (4 endpoints)
# =========================================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  6. MS-AUDIT" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

T 'GET  /api/v1/ (health)' GET "$AuditBase/api/v1/" @(200)
$auditEvt = PJ (T 'POST /api/v1/audit (create)' POST "$AuditBase/api/v1/audit" @(201) @{
  userId=$ownerId;vehicleId=$vehiculo.id;tipoCambio='TEST_AUDIT'
  servicioOrigen='TEST';detalles='End-to-end audit test'
}).Body
T 'GET  /api/v1/audit (list)' GET "$AuditBase/api/v1/audit" @(200)
T 'GET  /api/v1/audit/:id' GET "$AuditBase/api/v1/audit/$($auditEvt.id)" @(200)

# =========================================================================
# CLEANUP
# =========================================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  CLEANUP" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Asignacion
if ($asig) {
  T 'DEL  /asignaciones' DELETE "$TrazabilidadBase/asignaciones/$ownerId/$($vehiculo.id)" @(200) -Headers $sH
}
# Vehicle
T 'DEL  /vehiculos/:id' DELETE "$VehiculosBase/vehiculos/$($vehiculo.id)" @(200) -Headers $sH
# Espacios
T 'DEL  /espacios/:id (2)' DELETE "$ZonasBase/api/v1/espacios/$($esp2.idEspacio)" @(200) -Headers $mH
T 'DEL  /espacios/:id (1)' DELETE "$ZonasBase/api/v1/espacios/$($esp1.idEspacio)" @(200) -Headers $mH
# Zona
T 'DEL  /zonas/:id' DELETE "$ZonasBase/api/v1/zonas/$($zona.idZona)" @(200) -Headers $mH
# Test role-usuario
T 'DEL  /roles-Usuario (clear test)' DELETE "$UsuariosBase/roles-Usuario?id_usuario=$($empReg.id)&id_rol=$($testRole.id)" @(200) -Headers $sH
# Test usuario + persona
T 'DEL  /usuario/:id (test usr)' DELETE "$UsuariosBase/usuario/$($usuario.id)" @(200) -Headers $sH
T 'DEL  /persona/:id (test usr)' DELETE "$UsuariosBase/persona/$($personaU.id)" @(200) -Headers $sH
# Test persona
T 'DEL  /persona/:id (test pers)' DELETE "$UsuariosBase/persona/$($persona.id)" @(200) -Headers $sH
# Test role
T 'DEL  /roles/:id (test role)' DELETE "$UsuariosBase/roles/$($testRole.id)" @(200) -Headers $sH
# Employee
T 'DEL  /roles-Usuario (emp clear)' DELETE "$UsuariosBase/roles-Usuario?id_usuario=$($empReg.id)&id_rol=$($empRole.id)" @(200) -Headers $sH
$empDel = Curl -Method DELETE -Url "$UsuariosBase/usuario/$($empReg.id)" -Headers $sH
if ($empDel.StatusCode -ne 200) {
  Write-Host "  [INFO] Employee user FK-blocked, deactivating" -ForegroundColor DarkYellow
  Curl -Method PATCH -Url "$UsuariosBase/usuario/$($empReg.id)/activar-desactivar" -Headers $sH | Out-Null
}

# =========================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TOTALS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PASS: $($script:Pass)" -ForegroundColor $(if($script:Fail -eq 0){"Green"}else{"Red"})
Write-Host "  FAIL: $($script:Fail)" -ForegroundColor $(if($script:Fail -eq 0){"Green"}else{"Red"})
Write-Host "  TOTAL: $($script:Pass + $script:Fail)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
