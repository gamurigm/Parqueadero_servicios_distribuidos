param(
  [string]$UsuariosBase = "http://localhost:5000",
  [string]$VehiculosBase = "http://localhost:3001",
  [string]$ZonasBase = "http://localhost:8081",
  [string]$TrazabilidadBase = "http://localhost:3002",
  [string]$TicketsBase = "http://localhost:3003"
)

$ErrorActionPreference = 'Stop'
$script:PassCount = 0
$script:FailCount = 0

function New-ShortId {
  return ([guid]::NewGuid().ToString('N').Substring(0, 8))
}

function New-ValidCedula {
  $digits = (1..6 | ForEach-Object { Get-Random -Minimum 0 -Maximum 10 }) -join ''
  $body9 = "175" + $digits
  $coef = @(2, 1, 2, 1, 2, 1, 2, 1, 2)
  $sum = 0

  for ($i = 0; $i -lt 9; $i++) {
    $digit = [int]::Parse($body9.Substring($i, 1))
    $prod = $digit * $coef[$i]
    if ($prod -gt 9) { $prod -= 9 }
    $sum += $prod
  }

  $check = (10 - ($sum % 10)) % 10
  return "$body9$check"
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
      Body = $bodyText
      ExitCode = $exitCode
      Method = $Method
      Url = $Url
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
    Write-Host ($Response.Body.Trim()) -ForegroundColor DarkGray
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

function Wait-For {
  param(
    [string]$Name,
    [string]$Url,
    [int[]]$ExpectedStatus = @(200, 401, 403)
  )

  for ($i = 0; $i -lt 45; $i++) {
    $response = Invoke-CurlJson -Method GET -Url $Url
    if ($ExpectedStatus -contains $response.StatusCode) {
      Write-Host "[PASS] $Name ready -> $($response.StatusCode)" -ForegroundColor Green
      return
    }
    Start-Sleep -Seconds 1
  }

  throw "Service not ready: $Name"
}

function Parse-Json {
  param([string]$Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return $null }
  return $Text | ConvertFrom-Json
}

function Find-Role {
  param(
    [object[]]$Roles,
    [string]$Name
  )
  return $Roles | Where-Object { $_.nombre -eq $Name } | Select-Object -First 1
}

function Login-User {
  param(
    [string]$BaseUrl,
    [string]$Username,
    [string]$Password,
    [string]$Name
  )

  $resp = Test-Request -Name $Name -Method POST -Url "$BaseUrl/auth/login" -ExpectedStatus @(200) -Body @{
    username = $Username
    password = $Password
  }
  return Parse-Json $resp.Body
}

function Create-RoleIfMissing {
  param(
    [string]$BaseUrl,
    [string]$Token,
    [string]$Name,
    [string]$Description
  )

  $headers = @{ Authorization = "Bearer $Token" }
  $listResp = Test-Request -Name "GET roles before ensure $Name" -Method GET -Url "$BaseUrl/roles" -ExpectedStatus @(200) -Headers $headers
  $roles = Parse-Json $listResp.Body
  $existing = Find-Role -Roles $roles -Name $Name
  if ($existing) { return $existing }

  $createResp = Test-Request -Name "POST role $Name" -Method POST -Url "$BaseUrl/roles" -ExpectedStatus @(201, 409) -Headers $headers -Body @{
    nombre = $Name
    descripcion = $Description
  }

  if ($createResp.StatusCode -eq 201) {
    return Parse-Json $createResp.Body
  }

  $listResp = Test-Request -Name "GET roles after create $Name" -Method GET -Url "$BaseUrl/roles" -ExpectedStatus @(200) -Headers $headers
  $roles = Parse-Json $listResp.Body
  $existing = Find-Role -Roles $roles -Name $Name
  if (-not $existing) {
    throw "Role $Name was not found after create attempt"
  }
  return $existing
}

function New-EcuadorianCedula {
  return New-ValidCedula
}

Write-Host "Waiting for services..." -ForegroundColor Cyan
Wait-For -Name 'usuarios' -Url "$UsuariosBase/"
Wait-For -Name 'vehiculos' -Url "$VehiculosBase/vehiculos"
Wait-For -Name 'trazabilidad' -Url "$TrazabilidadBase/trazabilidad/historial" -ExpectedStatus @(401, 403, 200)
Wait-For -Name 'tickets' -Url "$TicketsBase/"
Wait-For -Name 'zonas' -Url "$ZonasBase/api/v1/zonas/"
Wait-For -Name 'espacios' -Url "$ZonasBase/api/v1/espacios/"

Write-Host "Logging in seed users..." -ForegroundColor Cyan
$admin = Login-User -BaseUrl $UsuariosBase -Username 'admin1' -Password 'Admin123!' -Name 'Admin login'
$owner = Login-User -BaseUrl $UsuariosBase -Username 'jpropiet' -Password 'Prop123!' -Name 'Owner login'
$zoneManager = Login-User -BaseUrl $UsuariosBase -Username 'emple1' -Password 'Admin123!' -Name 'Zone manager login'
$superUser = Login-User -BaseUrl $UsuariosBase -Username 'super1' -Password 'Super123!' -Name 'Super user login'

$adminHeaders = @{ Authorization = "Bearer $($admin.access_token)" }
$ownerHeaders = @{ Authorization = "Bearer $($owner.access_token)" }
$zoneHeaders = @{ Authorization = "Bearer $($zoneManager.access_token)" }
$superHeaders = @{ Authorization = "Bearer $($superUser.access_token)" }

Write-Host "Ensuring empleado role and registering employee user..." -ForegroundColor Cyan
$empleadoRole = Create-RoleIfMissing -BaseUrl $UsuariosBase -Token $admin.access_token -Name 'empleado' -Description 'Rol para operaciones de tickets y asignaciones'

$employeePassword = 'Emp12345!'
$employeeCedula = New-EcuadorianCedula
$employeeEmail = "curl.emp.$(New-ShortId)@example.com"
$employeePhone = "099$((Get-Random -Minimum 1000000 -Maximum 9999999).ToString())"
$employeeRegisterResp = Test-Request -Name 'POST auth/register employee' -Method POST -Url "$UsuariosBase/auth/register" -ExpectedStatus @(201) -Body @{
  cedula = $employeeCedula
  firstName = 'Luis'
  middleName = 'Carlos'
  lastName = 'Curl'
  email = $employeeEmail
  nationality = 'Ecuatoriana'
  phone = $employeePhone
  address = 'Av Curl 123'
  rolId = $empleadoRole.id
  password = $employeePassword
}
$employeeRegister = Parse-Json $employeeRegisterResp.Body
$employee = Login-User -BaseUrl $UsuariosBase -Username $employeeRegister.username -Password $employeePassword -Name 'Employee login'
$employeeHeaders = @{ Authorization = "Bearer $($employee.access_token)" }

Write-Host "Creating temp entities for CRUD tests..." -ForegroundColor Cyan
$tempSuffix = New-ShortId
$tempCedula = New-EcuadorianCedula
$tempEmail = "curl.temp.$tempSuffix@example.com"
$tempPhone = "098$((Get-Random -Minimum 1000000 -Maximum 9999999).ToString())"
$tempUsername = "usr$($tempSuffix.Substring(0,6))"
$tempRoleAName = "curl_role_$($tempSuffix.Substring(0,6))"
$tempRoleBName = "curl_role_$($tempSuffix.Substring(2,6))_b"

$tempRoleA = Create-RoleIfMissing -BaseUrl $UsuariosBase -Token $admin.access_token -Name $tempRoleAName -Description 'Rol temporal A'
$tempRoleB = Create-RoleIfMissing -BaseUrl $UsuariosBase -Token $admin.access_token -Name $tempRoleBName -Description 'Rol temporal B'

  $propietarioRole = Create-RoleIfMissing -BaseUrl $UsuariosBase -Token $admin.access_token -Name "curl_propietario_$tempSuffix" -Description 'Rol propietario temporal para asignaciones y tickets'

  $propietarioCedula = New-EcuadorianCedula
  $propietarioEmail = "curl.prop.$tempSuffix@example.com"
  $propietarioPhone = "097$((Get-Random -Minimum 1000000 -Maximum 9999999).ToString())"
  $propietarioRegisterResp = Test-Request -Name 'POST auth/register propietario' -Method POST -Url "$UsuariosBase/auth/register" -ExpectedStatus @(201) -Body @{
    cedula = $propietarioCedula
    firstName = 'Pedro'
    middleName = 'Luis'
    lastName = 'Curl'
    email = $propietarioEmail
    nationality = 'Ecuatoriana'
    phone = $propietarioPhone
    address = 'Av Prop Curl 123'
    rolId = $propietarioRole.id
    password = 'Prop12345!'
  }
  $propietario = Parse-Json $propietarioRegisterResp.Body


$tempPersonResp = Test-Request -Name 'POST persona admin' -Method POST -Url "$UsuariosBase/persona" -ExpectedStatus @(201) -Headers $adminHeaders -Body @{
  firstName = 'Ana'
  middleName = 'Maria'
  lastName = 'Curl'
  dni = $tempCedula
  email = $tempEmail
  address = 'Calle Temporal 123'
  nationality = 'Ecuatoriana'
  phone = $tempPhone
  tipo = 'natural'
}
$tempPerson = Parse-Json $tempPersonResp.Body

$tempUserResp = Test-Request -Name 'POST usuario admin' -Method POST -Url "$UsuariosBase/usuario" -ExpectedStatus @(201) -Headers $adminHeaders -Body @{
  id = $tempPerson.id
  username = $tempUsername
  password = 'Temp12345!'
}
$tempUser = Parse-Json $tempUserResp.Body

Write-Host "Running auth checks..." -ForegroundColor Cyan
Test-Request -Name 'GET auth/profile employee' -Method GET -Url "$UsuariosBase/auth/profile" -ExpectedStatus @(200) -Headers $employeeHeaders | Out-Null
$refreshResp = Test-Request -Name 'POST auth/refresh employee' -Method POST -Url "$UsuariosBase/auth/refresh" -ExpectedStatus @(200) -Body @{
  refreshToken = $employee.refresh_token
}
$refreshData = Parse-Json $refreshResp.Body
Test-Request -Name 'POST auth/logout employee' -Method POST -Url "$UsuariosBase/auth/logout" -ExpectedStatus @(200) -Headers $employeeHeaders -Body @{
  refreshToken = $refreshData.refresh_token
} | Out-Null

Write-Host "Running roles and roles_usuario checks..." -ForegroundColor Cyan
Test-Request -Name 'GET roles admin' -Method GET -Url "$UsuariosBase/roles" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'GET role by id admin' -Method GET -Url "$UsuariosBase/roles/$($tempRoleA.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'PUT role admin' -Method PUT -Url "$UsuariosBase/roles/$($tempRoleA.id)" -ExpectedStatus @(200) -Headers $adminHeaders -Body @{
  nombre = $tempRoleAName
  descripcion = 'Rol temporal A actualizado'
  activo = $true
} | Out-Null
Test-Request -Name 'PATCH role activate-deactivate admin' -Method PATCH -Url "$UsuariosBase/roles/$($tempRoleA.id)" -ExpectedStatus @(200) -Headers $adminHeaders -Body @{
  nombre = $tempRoleAName
  descripcion = 'Rol temporal A actualizado'
  activo = $false
} | Out-Null
Test-Request -Name 'PATCH role restore admin' -Method PATCH -Url "$UsuariosBase/roles/$($tempRoleA.id)" -ExpectedStatus @(200) -Headers $adminHeaders -Body @{
  nombre = $tempRoleAName
  descripcion = 'Rol temporal A actualizado'
  activo = $true
} | Out-Null
Test-Request -Name 'POST role denied for owner' -Method POST -Url "$UsuariosBase/roles" -ExpectedStatus @(403) -Headers $ownerHeaders -Body @{
  nombre = "deny_$tempSuffix"
  descripcion = 'Debe fallar'
} | Out-Null

$assignmentBody = @{
  id_user = $tempUser.id
  id_rol = $tempRoleA.id
}
$assignmentResp = Test-Request -Name 'POST roles-Usuario admin' -Method POST -Url "$UsuariosBase/roles-Usuario" -ExpectedStatus @(201) -Headers $adminHeaders -Body $assignmentBody
$assignment = Parse-Json $assignmentResp.Body
Test-Request -Name 'GET roles-Usuario list admin' -Method GET -Url "$UsuariosBase/roles-Usuario" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'GET roles-Usuario asignacion admin' -Method GET -Url "$UsuariosBase/roles-Usuario/asignacion" -ExpectedStatus @(200) -Headers $adminHeaders -Body @{
  id_user = $tempUser.id
  id_rol = $tempRoleA.id
  id_nuevo_rol = $tempRoleB.id
} | Out-Null
Test-Request -Name 'GET roles-Usuario by user admin' -Method GET -Url "$UsuariosBase/roles-Usuario/usuarios/$($tempUser.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'GET roles-Usuario by role admin' -Method GET -Url "$UsuariosBase/roles-Usuario/roles/$($tempRoleA.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'PUT roles-Usuario admin' -Method PUT -Url "$UsuariosBase/roles-Usuario" -ExpectedStatus @(200) -Headers $adminHeaders -Body @{
  id_user = $tempUser.id
  id_rol = $tempRoleA.id
  id_nuevo_rol = $tempRoleB.id
} | Out-Null
Test-Request -Name 'PATCH roles-Usuario active-deactive admin' -Method PATCH -Url "$UsuariosBase/roles-Usuario/activar-desactivar" -ExpectedStatus @(200) -Headers $adminHeaders -Body @{
  id_user = $tempUser.id
  id_rol = $tempRoleB.id
} | Out-Null
Test-Request -Name 'PATCH roles-Usuario reactivate admin' -Method PATCH -Url "$UsuariosBase/roles-Usuario/activar-desactivar" -ExpectedStatus @(200) -Headers $adminHeaders -Body @{
  id_user = $tempUser.id
  id_rol = $tempRoleB.id
} | Out-Null
Test-Request -Name 'DELETE roles-Usuario admin clear' -Method DELETE -Url "$UsuariosBase/roles-Usuario" -ExpectedStatus @(200) -Headers $adminHeaders -Body @{
  id_user = $tempUser.id
  id_rol = $tempRoleB.id
  id_nuevo_rol = $tempRoleB.id
} | Out-Null
Test-Request -Name 'POST roles-Usuario denied for employee' -Method POST -Url "$UsuariosBase/roles-Usuario" -ExpectedStatus @(403) -Headers $employeeHeaders -Body @{
  id_user = $tempUser.id
  id_rol = $tempRoleA.id
} | Out-Null

Write-Host "Running persona and usuario checks..." -ForegroundColor Cyan
Test-Request -Name 'GET persona list admin' -Method GET -Url "$UsuariosBase/persona" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'GET persona by cedula admin' -Method GET -Url "$UsuariosBase/persona/cedula/$tempCedula" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'GET persona by id admin' -Method GET -Url "$UsuariosBase/persona/$($tempPerson.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'PUT persona admin' -Method PUT -Url "$UsuariosBase/persona/$($tempPerson.id)" -ExpectedStatus @(200) -Headers $adminHeaders -Body @{
  firstName = 'Ana'
  middleName = 'Maria'
  lastName = 'Curl'
  dni = $tempCedula
  email = "curl.temp.$tempSuffix.updated@example.com"
  address = 'Calle Temporal 456'
  nationality = 'Ecuatoriana'
  phone = "097$((Get-Random -Minimum 1000000 -Maximum 9999999).ToString())"
  tipo = 'natural'
} | Out-Null
Test-Request -Name 'PATCH persona active-state admin' -Method PATCH -Url "$UsuariosBase/persona/$($tempPerson.id)/cambio-de-estado" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'POST persona denied for owner' -Method POST -Url "$UsuariosBase/persona" -ExpectedStatus @(403) -Headers $ownerHeaders -Body @{
  firstName = 'Juan'
  middleName = 'Test'
  lastName = 'Denied'
  dni = (New-EcuadorianCedula)
  email = "deny.$tempSuffix@example.com"
  address = 'Calle Denegada 1'
  nationality = 'Ecuatoriana'
  phone = "096$((Get-Random -Minimum 1000000 -Maximum 9999999).ToString())"
  tipo = 'natural'
} | Out-Null

Test-Request -Name 'GET usuario list admin' -Method GET -Url "$UsuariosBase/usuario" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'GET usuario by id admin' -Method GET -Url "$UsuariosBase/usuario/$($tempUser.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'PUT usuario admin' -Method PUT -Url "$UsuariosBase/usuario/$($tempUser.id)" -ExpectedStatus @(200) -Headers $adminHeaders -Body @{
  username = "usr$((New-ShortId).Substring(0,4))"
} | Out-Null
Test-Request -Name 'PATCH usuario password admin' -Method PATCH -Url "$UsuariosBase/usuario/$($tempUser.id)" -ExpectedStatus @(200) -Headers $adminHeaders -Body @{
  newpassword = 'Temp54321!'
} | Out-Null
Test-Request -Name 'PATCH usuario toggle admin' -Method PATCH -Url "$UsuariosBase/usuario/$($tempUser.id)/activar-desactivar" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'PATCH usuario toggle restore admin' -Method PATCH -Url "$UsuariosBase/usuario/$($tempUser.id)/activar-desactivar" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'POST usuario denied for owner' -Method POST -Url "$UsuariosBase/usuario" -ExpectedStatus @(403) -Headers $ownerHeaders -Body @{
  id = [guid]::NewGuid().ToString()
  username = 'denyusr'
  password = 'Temp12345!'
} | Out-Null

Write-Host "Running vehiculos checks..." -ForegroundColor Cyan
$vehicleResp = Test-Request -Name 'POST vehiculo owner' -Method POST -Url "$VehiculosBase/vehiculos" -ExpectedStatus @(201) -Headers $ownerHeaders -Body @{
  tipo = 'auto'
  datos = @{
    placa = "CRT-$((Get-Random -Minimum 1000 -Maximum 9999).ToString())"
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
Test-Request -Name 'GET vehiculos list owner' -Method GET -Url "$VehiculosBase/vehiculos" -ExpectedStatus @(200) -Headers $ownerHeaders | Out-Null
Test-Request -Name 'GET vehiculo by id owner' -Method GET -Url "$VehiculosBase/vehiculos/$($vehicle.id)" -ExpectedStatus @(200) -Headers $ownerHeaders | Out-Null
Test-Request -Name 'PUT vehiculo owner' -Method PUT -Url "$VehiculosBase/vehiculos/$($vehicle.id)" -ExpectedStatus @(200) -Headers $ownerHeaders -Body @{
  tipo = 'auto'
  datos = @{
    placa = $vehicle.placa
    marca = 'Toyota'
    modelo = 'Corolla'
    color = 'Gris'
    anio = 2024
    clasificacion = 'Gasolina'
    numeroPuertas = 4
    capacidadMaletero = 460
  }
} | Out-Null
Test-Request -Name 'DELETE vehiculo denied for owner' -Method DELETE -Url "$VehiculosBase/vehiculos/$($vehicle.id)" -ExpectedStatus @(403) -Headers $ownerHeaders | Out-Null

Write-Host "Running zonas checks..." -ForegroundColor Cyan
Test-Request -Name 'GET zonas public' -Method GET -Url "$ZonasBase/api/v1/zonas/" -ExpectedStatus @(200) | Out-Null
Test-Request -Name 'GET espacios public' -Method GET -Url "$ZonasBase/api/v1/espacios/" -ExpectedStatus @(200) | Out-Null
Test-Request -Name 'POST zona denied for owner' -Method POST -Url "$ZonasBase/api/v1/zonas/" -ExpectedStatus @(403) -Headers $ownerHeaders -Body @{
  nombre = "Zona Denegada $tempSuffix"
  descripcion = 'Debe fallar'
  tipoZona = 'REGULAR'
  capacidad = 10
} | Out-Null

$zoneResp = Test-Request -Name 'POST zona admin' -Method POST -Url "$ZonasBase/api/v1/zonas/" -ExpectedStatus @(201) -Headers $adminHeaders -Body @{
  nombre = "Zona Curl $tempSuffix"
  descripcion = 'Zona temporal para pruebas'
  tipoZona = 'REGULAR'
  capacidad = 10
}
$zone = Parse-Json $zoneResp.Body
Test-Request -Name 'PUT zona manager' -Method PUT -Url "$ZonasBase/api/v1/zonas/$($zone.idZona)" -ExpectedStatus @(200) -Headers $zoneHeaders -Body @{
  nombre = "Zona Curl $tempSuffix"
  descripcion = 'Zona temporal actualizada'
  tipoZona = 'REGULAR'
  capacidad = 12
} | Out-Null

$spaceResp1 = Test-Request -Name 'POST espacio manager 1' -Method POST -Url "$ZonasBase/api/v1/espacios/" -ExpectedStatus @(201) -Headers $zoneHeaders -Body @{
  idZona = $zone.idZona
  descripcion = 'Espacio 1'
  tipoEspacio = 'AUTO'
}
$space1 = Parse-Json $spaceResp1.Body

$spaceResp2 = Test-Request -Name 'POST espacio manager 2' -Method POST -Url "$ZonasBase/api/v1/espacios/" -ExpectedStatus @(201) -Headers $zoneHeaders -Body @{
  idZona = $zone.idZona
  descripcion = 'Espacio 2'
  tipoEspacio = 'AUTO'
}
$space2 = Parse-Json $spaceResp2.Body

Test-Request -Name 'GET espacios by zone manager' -Method GET -Url "$ZonasBase/api/v1/espacios/zona/$($zone.idZona)" -ExpectedStatus @(200) -Headers $zoneHeaders | Out-Null
Test-Request -Name 'PUT espacio manager' -Method PUT -Url "$ZonasBase/api/v1/espacios/$($space1.id)" -ExpectedStatus @(200) -Headers $zoneHeaders -Body @{
  idZona = $zone.idZona
  descripcion = 'Espacio 1 actualizado'
  tipoEspacio = 'AUTO'
} | Out-Null
  Test-Request -Name 'PATCH espacio toggle manager' -Method PATCH -Url "$ZonasBase/api/v1/espacios/$($space1.id)/activar-desactivar" -ExpectedStatus @(200) -Headers $zoneHeaders | Out-Null
  Test-Request -Name 'PATCH espacio estado manager' -Method PATCH -Url "$ZonasBase/api/v1/espacios/$($space1.id)/estado?estado=MANTENIMIENTO" -ExpectedStatus @(200) -Headers $zoneHeaders | Out-Null

Write-Host "Running asignaciones and trazabilidad checks..." -ForegroundColor Cyan
$assignmentCreateResp = Test-Request -Name 'POST asignacion employee' -Method POST -Url "$TrazabilidadBase/asignaciones" -ExpectedStatus @(201) -Headers $employeeHeaders -Body @{
  userId = $propietario.id
  vehicleId = $vehicle.id
  descripcion = 'Asignacion temporal para ticketing'
}
$assignmentCreated = Parse-Json $assignmentCreateResp.Body
Test-Request -Name 'GET asignaciones employee' -Method GET -Url "$TrazabilidadBase/asignaciones" -ExpectedStatus @(200) -Headers $employeeHeaders | Out-Null
Test-Request -Name 'GET asignacion by key owner' -Method GET -Url "$TrazabilidadBase/asignaciones/$($propietario.id)/$($vehicle.id)" -ExpectedStatus @(200) -Headers $ownerHeaders | Out-Null
Test-Request -Name 'GET asignaciones by owner' -Method GET -Url "$TrazabilidadBase/asignaciones/propietario/$($propietario.id)" -ExpectedStatus @(200) -Headers $ownerHeaders | Out-Null
Test-Request -Name 'GET asignaciones trazabilidad historial admin' -Method GET -Url "$TrazabilidadBase/asignaciones/trazabilidad/historial" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'GET asignaciones trazabilidad by owner admin' -Method GET -Url "$TrazabilidadBase/asignaciones/trazabilidad/propietario/$($propietario.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'GET asignaciones trazabilidad by key admin' -Method GET -Url "$TrazabilidadBase/asignaciones/trazabilidad/$($propietario.id)/$($vehicle.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'GET trazabilidad historial admin' -Method GET -Url "$TrazabilidadBase/trazabilidad/historial" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'GET trazabilidad microservicio admin' -Method GET -Url "$TrazabilidadBase/trazabilidad/microservicio/TICKETS" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'GET trazabilidad by owner admin' -Method GET -Url "$TrazabilidadBase/trazabilidad/propietario/$($propietario.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'GET trazabilidad by asignacion admin' -Method GET -Url "$TrazabilidadBase/trazabilidad/$($propietario.id)/$($vehicle.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'POST trazabilidad registrar admin' -Method POST -Url "$TrazabilidadBase/trazabilidad/registrar" -ExpectedStatus @(201) -Headers $adminHeaders -Body @{
  microservicio = 'VEHICULOS'
  endpoint = 'POST /vehiculos'
  metodoHttp = 'POST'
  tipoAccion = 'CREACION'
  descripcion = 'Evento de prueba por curl'
  entidadId = $vehicle.id
  usuarioEjecutor = $admin.id
  usuarioEjecutorNombre = $admin.username
  payloadAnterior = $null
  payloadNuevo = @{
    placa = $vehicle.placa
  }
} | Out-Null
Test-Request -Name 'POST trazabilidad registrar denied for owner' -Method POST -Url "$TrazabilidadBase/trazabilidad/registrar" -ExpectedStatus @(403) -Headers $ownerHeaders -Body @{
  microservicio = 'VEHICULOS'
  endpoint = 'POST /vehiculos'
  metodoHttp = 'POST'
  tipoAccion = 'CREACION'
  descripcion = 'Debe fallar'
} | Out-Null
Test-Request -Name 'PUT asignacion owner' -Method PUT -Url "$TrazabilidadBase/asignaciones/$($propietario.id)/$($vehicle.id)" -ExpectedStatus @(200) -Headers $ownerHeaders -Body @{
  estado = 0
  descripcion = 'Asignacion pausada'
} | Out-Null
Test-Request -Name 'PUT asignacion restore owner' -Method PUT -Url "$TrazabilidadBase/asignaciones/$($propietario.id)/$($vehicle.id)" -ExpectedStatus @(200) -Headers $ownerHeaders -Body @{
  estado = 1
  descripcion = 'Asignacion activa'
} | Out-Null

Write-Host "Running tickets checks..." -ForegroundColor Cyan
$ticketResp1 = Test-Request -Name 'POST ticket emitir employee' -Method POST -Url "$TicketsBase/emitir" -ExpectedStatus @(201) -Headers $employeeHeaders -Body @{
  idEspacio = $space1.id
  cedula = $propietarioCedula
  placa = $vehicle.placa
}
$ticket1 = Parse-Json $ticketResp1.Body
Test-Request -Name 'GET tickets list employee' -Method GET -Url "$TicketsBase/" -ExpectedStatus @(200) -Headers $employeeHeaders | Out-Null
Test-Request -Name 'GET ticket by id employee' -Method GET -Url "$TicketsBase/$($ticket1.id)" -ExpectedStatus @(200) -Headers $employeeHeaders | Out-Null
Test-Request -Name 'GET ticket by code employee' -Method GET -Url "$TicketsBase/codigo/$($ticket1.codigoTicket)" -ExpectedStatus @(200) -Headers $employeeHeaders | Out-Null
Test-Request -Name 'POST ticket pagar employee' -Method POST -Url "$TicketsBase/pagar" -ExpectedStatus @(200) -Headers $employeeHeaders -Body @{
  idTicket = $ticket1.id
} | Out-Null

$ticketResp2 = Test-Request -Name 'POST ticket emitir employee second' -Method POST -Url "$TicketsBase/emitir" -ExpectedStatus @(201) -Headers $employeeHeaders -Body @{
  idEspacio = $space2.id
  cedula = $propietarioCedula
  placa = $vehicle.placa
}
$ticket2 = Parse-Json $ticketResp2.Body
Test-Request -Name 'POST ticket anular employee' -Method POST -Url "$TicketsBase/anular" -ExpectedStatus @(200) -Headers $employeeHeaders -Body @{
  idTicket = $ticket2.id
  motivo = 'Prueba de anulacion'
} | Out-Null
Test-Request -Name 'POST ticket denied for owner' -Method POST -Url "$TicketsBase/emitir" -ExpectedStatus @(403) -Headers $ownerHeaders -Body @{
  idEspacio = $space1.id
  cedula = $propietarioCedula
  placa = $vehicle.placa
} | Out-Null

  Test-Request -Name 'PATCH zona manager' -Method PATCH -Url "$ZonasBase/api/v1/zonas/$($zone.idZona)/activar-desactivar?forzar=true" -ExpectedStatus @(200) -Headers $zoneHeaders | Out-Null

Write-Host "Running cleanup and admin deletes..." -ForegroundColor Cyan
Test-Request -Name 'DELETE asignacion admin' -Method DELETE -Url "$TrazabilidadBase/asignaciones/$($propietario.id)/$($vehicle.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'DELETE ticket read by code after admin cleanup still readable if exists' -Method GET -Url "$TicketsBase/codigo/$($ticket1.codigoTicket)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'DELETE vehiculo admin' -Method DELETE -Url "$VehiculosBase/vehiculos/$($vehicle.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
  Test-Request -Name 'DELETE roles-Usuario admin clear propietario' -Method DELETE -Url "$UsuariosBase/roles-Usuario" -ExpectedStatus @(200) -Headers $adminHeaders -Body @{
    id_user = $propietario.id
    id_rol = $propietarioRole.id
    id_nuevo_rol = $propietarioRole.id
  } | Out-Null
  Test-Request -Name 'DELETE usuario propietario admin' -Method DELETE -Url "$UsuariosBase/usuario/$($propietario.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
  Test-Request -Name 'DELETE persona propietario admin' -Method DELETE -Url "$UsuariosBase/persona/$($propietario.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null

Test-Request -Name 'DELETE usuario admin' -Method DELETE -Url "$UsuariosBase/usuario/$($tempUser.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'DELETE persona admin' -Method DELETE -Url "$UsuariosBase/persona/$($tempPerson.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'DELETE role temp A admin' -Method DELETE -Url "$UsuariosBase/roles/$($tempRoleA.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'DELETE role temp B admin' -Method DELETE -Url "$UsuariosBase/roles/$($tempRoleB.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
  Test-Request -Name 'DELETE role propietario admin' -Method DELETE -Url "$UsuariosBase/roles/$($propietarioRole.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null

Test-Request -Name 'DELETE space 1 admin' -Method DELETE -Url "$ZonasBase/api/v1/espacios/$($space1.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'DELETE space 2 admin' -Method DELETE -Url "$ZonasBase/api/v1/espacios/$($space2.id)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null
Test-Request -Name 'DELETE zone admin' -Method DELETE -Url "$ZonasBase/api/v1/zonas/$($zone.idZona)" -ExpectedStatus @(200) -Headers $adminHeaders | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASS: $PassCount" -ForegroundColor Green
Write-Host "FAIL: $FailCount" -ForegroundColor Red
Write-Host "TOTAL: $($PassCount + $FailCount)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

if ($FailCount -gt 0) {
  exit 1
}





