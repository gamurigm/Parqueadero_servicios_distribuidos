$ErrorActionPreference = "Continue"
$BASE = "http://localhost:8000"
$results = @()
$testNum = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Token = "",
        [string]$Body = "",
        [int]$ExpectedStatus = 200,
        [string]$ExpectedContent = ""
    )
    $script:testNum++
    $headers = @{}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    $headers["Content-Type"] = "application/json"
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        if ($Body) { $params["Body"] = $Body }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $statusCode = [int]$response.StatusCode
        $content = $response.Content
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $content = ""
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $content = $reader.ReadToEnd()
        } catch {}
    }
    
    $pass = ($statusCode -eq $ExpectedStatus)
    $status = if ($pass) { "PASS" } else { "FAIL" }
    $result = [PSCustomObject]@{
        Test = $script:testNum
        Name = $Name
        Expected = $ExpectedStatus
        Actual = $statusCode
        Status = $status
        Body = $content
    }
    $script:results += $result
    $color = if ($pass) { "Green" } else { "Red" }
    Write-Host "[$status] #$($script:testNum) $Name (Expected: $ExpectedStatus, Got: $statusCode)" -ForegroundColor $color
    if (-not $pass -and $content) {
        Write-Host "  Response: $($content.Substring(0, [Math]::Min(300, $content.Length)))" -ForegroundColor Gray
    }
    return $content
}

# ============================================
# OBTENER TOKENS
# ============================================
Write-Host "`n========== OBTENIENDO TOKENS ==========" -ForegroundColor Cyan

$body = '{"username":"admin1","password":"Admin123!"}'
$adminToken = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token

$body = '{"username":"jcperez2","password":"pass1234"}'
$propToken = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token

$body = '{"username":"emple1","password":"Admin123!"}'
$empToken = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token

$body = '{"username":"jcperez3","password":"pass1234"}'
$suToken = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token

Write-Host "Todos los tokens obtenidos" -ForegroundColor Green

# ============================================
# FASE A: VALIDACIONES DE FORMATO / DTOs CORREGIDOS
# ============================================
Write-Host "`n========== FASE A: VALIDACIONES DE FORMATO CORREGIDOS ==========" -ForegroundColor Cyan

# A1: Crear usuario - el DTO solo acepta username + password (sin personaId)
Test-Endpoint "Crear usuario - admin (payload correcto)" "POST" "$BASE/usuarios/usuario" $adminToken '{"username":"testusr1","password":"TestPass123"}' 201

# A2: Crear vehiculo con formato correcto (tipo + datos anidados)
Test-Endpoint "Crear vehiculo auto - admin" "POST" "$BASE/vehiculos/vehiculos" $adminToken '{"tipo":"auto","datos":{"placa":"TST-1234","marca":"Toyota","modelo":"Corolla","color":"Blanco","anio":2024,"clasificacion":"Gasolina","numeroPuertas":4,"capacidadMaletero":450}}' 201

Test-Endpoint "Crear vehiculo moto - propietario" "POST" "$BASE/vehiculos/vehiculos" $propToken '{"tipo":"motocicleta","datos":{"placa":"GG-420A","marca":"Honda","modelo":"CBR","color":"Negro","anio":2022,"clasificacion":"Gasolina","tipo":"Deportiva"}}' 201

Test-Endpoint "Crear vehiculo camioneta - admin" "POST" "$BASE/vehiculos/vehiculos" $adminToken '{"tipo":"camioneta","datos":{"placa":"CAM-1234","marca":"Ford","modelo":"Ranger","color":"Gris","anio":2023,"clasificacion":"Diesel","cabina":"Doble","capacidadCarga":1500}}' 201

# A3: Crear zona con formato correcto (nombre, tipoZona, capacidad)
Test-Endpoint "Crear zona VIP - admin" "POST" "$BASE/zonas/api/v1/zonas/" $adminToken '{"nombre":"Zona VIP Test","descripcion":"Zona de prueba VIP","tipoZona":"VIP","capacidad":10}' 201

# A4: Login con password incorrecto - verificar status code
Test-Endpoint "Login password incorrecto (400 vs 401)" "POST" "$BASE/usuarios/auth/login" "" '{"username":"admin1","password":"wrongpassword"}' 400

# ============================================
# FASE B: PERMISOS DE SOLO LECTURA POR ROL (VERIFICACION RESTRINGIDA)
# ============================================
Write-Host "`n========== FASE B: RESTICCIONES POR ROL ==========" -ForegroundColor Cyan

# B1: Empleado no puede crear usuario
Test-Endpoint " empleado crear usuario (403)" "POST" "$BASE/usuarios/usuario" $empToken '{"username":"testbad","password":"TestPass123"}' 403

# B2: Propietario no puede crear usuario
Test-Endpoint "propietario crear usuario (403)" "POST" "$BASE/usuarios/usuario" $propToken '{"username":"testbad2","password":"TestPass123"}' 403

# B3: Empleado no puede crear vehiculo
Test-Endpoint "empleado crear vehiculo (403)" "POST" "$BASE/vehiculos/vehiculos" $empToken '{"tipo":"auto","datos":{"placa":"BAD-1234","marca":"Ford","modelo":"Focus","color":"Rojo","anio":2023,"clasificacion":"Gasolina","numeroPuertas":4,"capacidadMaletero":400}}' 403

# B4: Empleado no puede crear zona
Test-Endpoint "empleado crear zona (403)" "POST" "$BASE/zonas/api/v1/zonas/" $empToken '{"nombre":"Zona Bad","tipoZona":"REGULAR","capacidad":5}' 403

# B5: Propietario no puede listar tickets (policy: any authenticated can read)
Test-Endpoint "propietario listar tickets (allowed by policy)" "GET" "$BASE/tickets/" $propToken "" 200

# B6: Empleado no puede ver historial trazabilidad (solo admin/super)
Test-Endpoint "empleado historial trazabilidad (403)" "GET" "$BASE/trazabilidad/trazabilidad/historial" $empToken "" 403

# B7: Propietario no puede ver historial trazabilidad
Test-Endpoint "propietario historial trazabilidad (403)" "GET" "$BASE/trazabilidad/trazabilidad/historial" $propToken "" 403

# B8: Solo super_user puede borrar fisicamente (no lo probamos pero verificamos delete normal)
# B9: Super_user puede eliminar zona
# Primero obtener ID de una zona
$zonas = Invoke-RestMethod -Uri "$BASE/zonas/api/v1/zonas/?page=0&size=1" -Method Get -ContentType "application/json"
$zonaId = $zonas.content[0].idZona
Test-Endpoint "super_user eliminar zona" "DELETE" "$BASE/zonas/api/v1/zonas/$zonaId" $suToken "" 200

# B10: Empleado no puede eliminar zona
Test-Endpoint "empleado eliminar zona (403)" "DELETE" "$BASE/zonas/api/v1/zonas/$zonaId" $empToken "" 403

# ============================================
# FASE C: ESPACIOS POR ZONA CON TOKEN
# ============================================
Write-Host "`n========== FASE C: ESPACIOS POR ZONA CON AUTH ==========" -ForegroundColor Cyan

# Primero obtener un idZona existente
$zonasAll = Invoke-RestMethod -Uri "$BASE/zonas/api/v1/zonas/?page=0&size=1" -Method Get -ContentType "application/json"
$firstZonaId = $zonasAll.content[0].idZona
Write-Host "Usando zona ID: $firstZonaId" -ForegroundColor Gray

Test-Endpoint "espacios por zona - admin (con token)" "GET" "$BASE/zonas/api/v1/espacios/zona/$firstZonaId" $adminToken "" 200
Test-Endpoint "espacios por zona - propietario (con token)" "GET" "$BASE/zonas/api/v1/espacios/zona/$firstZonaId" $propToken "" 200
Test-Endpoint "espacios por zona - empleado (con token)" "GET" "$BASE/zonas/api/v1/espacios/zona/$firstZonaId" $empToken "" 200
Test-Endpoint "espacios por zona - sin token (401/403)" "GET" "$BASE/zonas/api/v1/espacios/zona/$firstZonaId" "" "" 403

# ============================================
# FASE D: VALIDACIONES CRUZADAS TRAZABILIDAD
# ============================================
Write-Host "`n========== FASE D: VALIDACIONES CRUZADAS - TRAZABILIDAD ==========" -ForegroundColor Cyan

# D1: Obtener asignaciones existentes y verificar que tienen datos de propietario y vehiculo
$asignaciones = Invoke-RestMethod -Uri "$BASE/trazabilidad/asignaciones" -Method Get -ContentType "application/json" -Headers @{"Authorization"="Bearer $adminToken"}
$asigCount = $asignaciones.Count
Write-Host "Total asignaciones: $asigCount" -ForegroundColor Gray

if ($asigCount -gt 0) {
    $firstAsig = $asignaciones[0]
    $hasPropietario = $firstAsig.PSObject.Properties.Name -contains "propietario"
    $hasVehiculo = $firstAsig.PSObject.Properties.Name -contains "vehiculo"
    $hasUserId = $firstAsig.PSObject.Properties.Name -contains "userId"
    $hasVehicleId = $firstAsig.PSObject.Properties.Name -contains "vehicleId"
    
    Write-Host "  Asignacion tiene campo 'propietario': $hasPropietario" -ForegroundColor $(if($hasPropietario){"Green"}else{"Red"})
    Write-Host "  Asignacion tiene campo 'vehiculo': $hasVehiculo" -ForegroundColor $(if($hasVehiculo){"Green"}else{"Red"})
    Write-Host "  Asignacion tiene campo 'userId': $hasUserId" -ForegroundColor $(if($hasUserId){"Green"}else{"Red"})
    Write-Host "  Asignacion tiene campo 'vehicleId': $hasVehicleId" -ForegroundColor $(if($hasVehicleId){"Green"}else{"Red"})
    
    if ($hasPropietario) {
        $propData = $firstAsig.propietario
        Write-Host "  Propietario: $($propData | ConvertTo-Json -Compress)" -ForegroundColor Gray
    }
    if ($hasVehiculo) {
        $vehData = $firstAsig.vehiculo
        Write-Host "  Vehiculo: $($vehData | ConvertTo-Json -Compress)" -ForegroundColor Gray
    }
}

# D2: Trazabilidad historial - verificar que admin puede
Test-Endpoint "trazabilidad historial - admin (200)" "GET" "$BASE/trazabilidad/trazabilidad/historial" $adminToken "" 200

# D3: Verificar historial de trazabilidad tiene datos cruzados
$historial = Invoke-RestMethod -Uri "$BASE/trazabilidad/trazabilidad/historial" -Method Get -ContentType "application/json" -Headers @{"Authorization"="Bearer $adminToken"}
if ($historial.Count -gt 0) {
    $firstHist = $historial[0]
    $hasProp = $firstHist.PSObject.Properties.Name -contains "propietario"
    $hasVeh = $firstHist.PSObject.Properties.Name -contains "vehiculo"
    Write-Host "  Historial tiene propietario: $hasProp, vehiculo: $hasVeh" -ForegroundColor $(if($hasProp -and $hasVeh){"Green"}else{"Red"})
    Write-Host "  Historial sample: $($firstHist | ConvertTo-Json -Compress -Depth 3)" -ForegroundColor Gray
}

# D4: Super user puede historial trazabilidad
Test-Endpoint "trazabilidad historial - super_user (200)" "GET" "$BASE/trazabilidad/trazabilidad/historial" $suToken "" 200

# ============================================
# FASE E: VALIDACIONES CRUZADAS TICKETS
# ============================================
Write-Host "`n========== FASE E: VALIDACIONES CRUZADAS - TICKETS ==========" -ForegroundColor Cyan

# E1: Listar tickets y verificar datos cruzados
$tickets = Invoke-RestMethod -Uri "$BASE/tickets/" -Method Get -ContentType "application/json" -Headers @{"Authorization"="Bearer $adminToken"}
$ticketCount = $tickets.Count
Write-Host "Total tickets: $ticketCount" -ForegroundColor Gray

if ($ticketCount -gt 0) {
    $firstTicket = $tickets[0]
    Write-Host "  Ticket sample: $($firstTicket | ConvertTo-Json -Compress)" -ForegroundColor Gray
    
    # Verificar que tiene idEspacio (referencia cruzada a zonas/espacios)
    $hasEspacio = $firstTicket.PSObject.Properties.Name -contains "idEspacio"
    $hasPlaca = $firstTicket.PSObject.Properties.Name -contains "placa"
    $hasCedula = $firstTicket.PSObject.Properties.Name -contains "cedula"
    $hasIdEmpleado = $firstTicket.PSObject.Properties.Name -contains "idEmpleado"
    
    Write-Host "  Ticket tiene idEspacio: $hasEspacio" -ForegroundColor $(if($hasEspacio){"Green"}else{"Red"})
    Write-Host "  Ticket tiene placa: $hasPlaca" -ForegroundColor $(if($hasPlaca){"Green"}else{"Red"})
    Write-Host "  Ticket tiene cedula: $hasCedula" -ForegroundColor $(if($hasCedula){"Green"}else{"Red"})
    Write-Host "  Ticket tiene idEmpleado: $hasIdEmpleado" -ForegroundColor $(if($hasIdEmpleado){"Green"}else{"Red"})
}

# E2: Verificar que el espacio del ticket existe en zonas
if ($ticketCount -gt 0 -and $hasEspacio) {
    $espacioId = $firstTicket.idEspacio
    Write-Host "  Verificando espacio $espacioId en zonas..." -ForegroundColor Gray
    try {
        $espacios = Invoke-RestMethod -Uri "$BASE/zonas/api/v1/espacios/" -Method Get -ContentType "application/json"
        $foundEspacio = $espacios | Where-Object { $_.id -eq $espacioId }
        if ($foundEspacio) {
            Write-Host "  [OK] Espacio $espacioId encontrado en zona: $($foundEspacio.nombreZona)" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Espacio $espacioId NO encontrado en lista de espacios" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [ERROR] No se pudo verificar espacio: $_" -ForegroundColor Red
    }
}

# E3: Verificar que la placa del ticket existe en vehiculos
if ($ticketCount -gt 0 -and $hasPlaca) {
    $placa = $firstTicket.placa
    Write-Host "  Verificando placa $placa en vehiculos..." -ForegroundColor Gray
    try {
        $vehiculos = Invoke-RestMethod -Uri "$BASE/vehiculos/vehiculos" -Method Get -ContentType "application/json" -Headers @{"Authorization"="Bearer $adminToken"}
        $foundVeh = $vehiculos | Where-Object { $_.placa -eq $placa }
        if ($foundVeh) {
            Write-Host "  [OK] Placa $placa encontrada en vehiculos: marca=$($foundVeh.marca), modelo=$($foundVeh.modelo)" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Placa $placa NO encontrada en lista de vehiculos" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [ERROR] No se pudo verificar placa: $_" -ForegroundColor Red
    }
}

# E4: Verificar que el idEmpleado del ticket existe en usuarios
if ($ticketCount -gt 0 -and $hasIdEmpleado) {
    $empId = $firstTicket.idEmpleado
    Write-Host "  Verificando idEmpleado $empId en usuarios..." -ForegroundColor Gray
    try {
        $usuarios = Invoke-RestMethod -Uri "$BASE/usuarios/usuario" -Method Get -ContentType "application/json" -Headers @{"Authorization"="Bearer $adminToken"}
        $foundUsr = $usuarios | Where-Object { $_.id -eq $empId }
        if ($foundUsr) {
            Write-Host "  [OK] Empleado $empId encontrado: $($foundUsr.username)" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Empleado $empId NO encontrado en usuarios" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [ERROR] No se pudo verificar empleado: $_" -ForegroundColor Red
    }
}

# ============================================
# FASE F: AUDIT - VERIFICAR EVENTOS
# ============================================
Write-Host "`n========== FASE F: AUDIT - VERIFICACION DE EVENTOS ==========" -ForegroundColor Cyan

$auditEvents = Invoke-RestMethod -Uri "$BASE/audit/api/v1/audit" -Method Get -ContentType "application/json"
$auditCount = $auditEvents.Count
Write-Host "Total eventos de auditoria: $auditCount" -ForegroundColor Gray

# Contar por servicio
$services = $auditEvents | Group-Object -Property servicio
foreach ($svc in $services) {
    Write-Host "  $($svc.Name): $($svc.Count) eventos" -ForegroundColor Gray
}

# Verificar que hay eventos de cada microservicio
$servNames = $services | Select-Object -ExpandProperty Name
$expectedServices = @("ms-usuarios", "ms-vehiculos")
foreach ($svc in $expectedServices) {
    $found = $servNames -contains $svc
    Write-Host "  [$(if($found){"OK"}else{"WARN"})] Servicio '$svc' tiene eventos: $found" -ForegroundColor $(if($found){"Green"}else{"Yellow"})
}

# Verificar campos de un evento de auditoria
if ($auditCount -gt 0) {
    $sampleAudit = $auditEvents[0]
    $fields = @("servicio", "accion", "entidad", "datos", "timestamp")
    foreach ($f in $fields) {
        $has = $sampleAudit.PSObject.Properties.Name -contains $f
        Write-Host "  Evento audit tiene '$f': $has" -ForegroundColor $(if($has){"Green"}else{"Red"})
    }
    Write-Host "  Sample evento: $($sampleAudit | ConvertTo-Json -Compress -Depth 2)" -ForegroundColor Gray
}

# ============================================
# FASE G: EDICION Y ACTIVAR/DESACTIVAR
# ============================================
Write-Host "`n========== FASE G: EDICION Y ACTIVAR/DESACTIVAR ==========" -ForegroundColor Cyan

# G1: Actualizar vehiculo - propietario
Test-Endpoint "propietario actualizar vehiculo (200)" "PUT" "$BASE/vehiculos/vehiculos/cf809a7c-2e9e-416a-a11e-d7731b019819" $propToken '{"tipo":"auto","datos":{"placa":"ABC-1234","marca":"Toyota","modelo":"Corolla 2024","color":"Azul","anio":2024,"clasificacion":"Gasolina","numeroPuertas":4,"capacidadMaletero":450}}' 200

# G2: Empleado no puede actualizar vehiculo
Test-Endpoint "empleado actualizar vehiculo (403)" "PUT" "$BASE/vehiculos/vehiculos/cf809a7c-2e9e-416a-a11e-d7731b019819" $empToken '{"tipo":"auto","datos":{"placa":"ABC-1234","marca":"Toyota","modelo":"Corolla 2024","color":"Azul","anio":2024,"clasificacion":"Gasolina","numeroPuertas":4,"capacidadMaletero":450}}' 403

# G3: Activar/desactivar usuario - admin
Test-Endpoint "admin activar/desactivar usuario (200)" "PATCH" "$BASE/usuarios/usuario/1742cc7e-45aa-47e9-81d2-0270e2cf0bff/activar-desactivar" $adminToken "" 200

# G4: Empleado no puede activar/desactivar usuario
Test-Endpoint "empleado activar/desactivar usuario (403)" "PATCH" "$BASE/usuarios/usuario/1742cc7e-45aa-47e9-81d2-0270e2cf0bff/activar-desactivar" $empToken "" 403

# G5: Activar/desactivar zona - admin
Test-Endpoint "admin activar/desactivar zona (200)" "PATCH" "$BASE/zonas/api/v1/zonas/$firstZonaId/activar-desactivar" $adminToken "" 200

# G6: Empleado no puede activar/desactivar zona (solo admin o encargado_zona)
# pero empleado tiene rol encargado_zona, asi que podria funcionar
Test-Endpoint "empleado activar/desactivar zona (encargado_zona=200)" "PATCH" "$BASE/zonas/api/v1/zonas/$firstZonaId/activar-desactivar" $empToken "" 200

# ============================================
# FASE H: ENDPOINT NO EXISTENTE / METODO NO PERMITIDO
# ============================================
Write-Host "`n========== FASE H: CASOS EDGE ==========" -ForegroundColor Cyan

# H1: GET a endpoint inexistente
Test-Endpoint "endpoint inexistente (404)" "GET" "$BASE/usuarios/noexiste" $adminToken "" 404

# H2: DELETE vehiculo - solo admin
$vehiculosList = Invoke-RestMethod -Uri "$BASE/vehiculos/vehiculos" -Method Get -ContentType "application/json" -Headers @{"Authorization"="Bearer $adminToken"}
$testVeh = $vehiculosList | Where-Object { $_.placa -eq "TST-1234" }
if ($testVeh) {
    Test-Endpoint "admin eliminar vehiculo test (200)" "DELETE" "$BASE/vehiculos/vehiculos/$($testVeh.id)" $adminToken "" 200
}

# H3: Propietario no puede eliminar vehiculo
$testVeh2 = $vehiculosList | Where-Object { $_.placa -eq "TST-1234" -or $_.placa -eq "GG-420A" }
if ($testVeh2) {
    Test-Endpoint "propietario eliminar vehiculo (403)" "DELETE" "$BASE/vehiculos/vehiculos/$($testVeh2.id)" $propToken "" 403
}

# ============================================
# RESUMEN
# ============================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "RESUMEN DE PRUEBAS Ronda 2" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
$total = $results.Count
$passed = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
Write-Host "Total: $total | Pass: $passed | Fail: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })

if ($failed -gt 0) {
    Write-Host "`nFALLOS:" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  #$($_.Test) $($_.Name) - Expected: $($_.Expected), Got: $($_.Actual)" -ForegroundColor Red
        if ($_.Body) { Write-Host "    Body: $($_.Body.Substring(0, [Math]::Min(200, $_.Body.Length)))" -ForegroundColor Gray }
    }
}

Write-Host "`nTODOS LOS PASARON:" -ForegroundColor Green
$results | Where-Object { $_.Status -eq "PASS" } | ForEach-Object {
    Write-Host "  #$($_.Test) $($_.Name)" -ForegroundColor Green
}
