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
        $content = if ($_.Exception.Response) { 
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.ReadToEnd()
        } else { $_.Exception.Message }
    }
    
    $pass = ($statusCode -eq $ExpectedStatus)
    $status = if ($pass) { "PASS" } else { "FAIL" }
    $result = [PSCustomObject]@{
        Test = $script:testNum
        Name = $Name
        Expected = $ExpectedStatus
        Actual = $statusCode
        Status = $status
    }
    $script:results += $result
    $color = if ($pass) { "Green" } else { "Red" }
    Write-Host "[$status] #$($script:testNum) $Name (Expected: $ExpectedStatus, Got: $statusCode)" -ForegroundColor $color
    return $content
}

# ============================================
# FASE 1: AUTH
# ============================================
Write-Host "`n========== FASE 1: AUTH ==========" -ForegroundColor Cyan

$body = '{"username":"admin1","password":"Admin123!"}'
$adminToken = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token

$body = '{"username":"jcperez2","password":"pass1234"}'
$propToken = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token

$body = '{"username":"emple1","password":"Admin123!"}'
$empToken = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token

$body = '{"username":"jcperez3","password":"pass1234"}'
$suToken = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token

Write-Host "Tokens obtenidos OK" -ForegroundColor Green

# Auth tests
Test-Endpoint "Login admin exitoso" "POST" "$BASE/usuarios/auth/login" "" '{"username":"admin1","password":"Admin123!"}' 200
Test-Endpoint "Login password incorrecto" "POST" "$BASE/usuarios/auth/login" "" '{"username":"admin1","password":"wrong"}' 401
Test-Endpoint "Auth profile sin token" "GET" "$BASE/usuarios/auth/profile" "" "" 401
Test-Endpoint "Auth profile con admin" "GET" "$BASE/usuarios/auth/profile" $adminToken "" 200

# ============================================
# FASE 2: USUARIOS
# ============================================
Write-Host "`n========== FASE 2: USUARIOS ==========" -ForegroundColor Cyan

# GET usuarios
Test-Endpoint "Listar usuarios - admin" "GET" "$BASE/usuarios/usuario" $adminToken "" 200
Test-Endpoint "Listar usuarios - propietario" "GET" "$BASE/usuarios/usuario" $propToken "" 200
Test-Endpoint "Listar usuarios - empleado" "GET" "$BASE/usuarios/usuario" $empToken "" 200
Test-Endpoint "Listar usuarios - super_user" "GET" "$BASE/usuarios/usuario" $suToken "" 200
Test-Endpoint "Listar usuarios - sin token" "GET" "$BASE/usuarios/usuario" "" "" 401

# GET personas
Test-Endpoint "Listar personas - admin" "GET" "$BASE/usuarios/persona" $adminToken "" 200

# POST usuario - solo admin y super_user
Test-Endpoint "Crear usuario - admin" "POST" "$BASE/usuarios/usuario" $adminToken '{"username":"testuser1","password":"Test1234!","personaId":"46c2a2ec-2eeb-4944-9c05-8fc1ea0a13e3"}' 201
Test-Endpoint "Crear usuario - propietario (debe fallar)" "POST" "$BASE/usuarios/usuario" $propToken '{"username":"testuser2","password":"Test1234!","personaId":"46c2a2ec-2eeb-4944-9c05-8fc1ea0a13e3"}' 403
Test-Endpoint "Crear usuario - empleado (debe fallar)" "POST" "$BASE/usuarios/usuario" $empToken '{"username":"testuser3","password":"Test1234!","personaId":"46c2a2ec-2eeb-4944-9c05-8fc1ea0a13e3"}' 403

# ============================================
# FASE 3: VEHICULOS
# ============================================
Write-Host "`n========== FASE 3: VEHICULOS ==========" -ForegroundColor Cyan

Test-Endpoint "Listar vehiculos - admin" "GET" "$BASE/vehiculos/vehiculos" $adminToken "" 200
Test-Endpoint "Listar vehiculos - propietario" "GET" "$BASE/vehiculos/vehiculos" $propToken "" 200
Test-Endpoint "Listar vehiculos - empleado" "GET" "$BASE/vehiculos/vehiculos" $empToken "" 200
Test-Endpoint "Listar vehiculos - sin token" "GET" "$BASE/vehiculos/vehiculos" "" "" 401

# Crear vehiculo - admin y propietario
Test-Endpoint "Crear vehiculo - admin" "POST" "$BASE/vehiculos/vehiculos" $adminToken '{"placa":"TEST001","tipo":"auto","marca":"Toyota","modelo":"Corolla","color":"Blanco","anio":2023}' 201
Test-Endpoint "Crear vehiculo - propietario" "POST" "$BASE/vehiculos/vehiculos" $propToken '{"placa":"TEST002","tipo":"moto","marca":"Honda","modelo":"CBR","color":"Negro","anio":2022}' 201
Test-Endpoint "Crear vehiculo - empleado (debe fallar)" "POST" "$BASE/vehiculos/vehiculos" $empToken '{"placa":"TEST003","tipo":"auto","marca":"Ford","modelo":"Focus","color":"Azul","anio":2023}' 403

# ============================================
# FASE 4: ZONAS Y ESPACIOS
# ============================================
Write-Host "`n========== FASE 4: ZONAS Y ESPACIOS ==========" -ForegroundColor Cyan

# Zonas - lectura publica
Test-Endpoint "Listar zonas (publico)" "GET" "$BASE/zonas/api/v1/zonas/" "" "" 200
Test-Endpoint "Listar zonas - admin" "GET" "$BASE/zonas/api/v1/zonas/" $adminToken "" 200

# Crear zona - admin/super_user
Test-Endpoint "Crear zona - admin" "POST" "$BASE/zonas/api/v1/zonas/" $adminToken '{"nombre":"Zona Test","tipo":"regular","tarifaRegular":2.5,"tarifaReservado":5.0,"capacidadAuto":5,"capacidadMoto":3,"capacidadCamioneta":2}' 201
Test-Endpoint "Crear zona - empleado (debe fallar)" "POST" "$BASE/zonas/api/v1/zonas/" $empToken '{"nombre":"Zona Test2","tipo":"regular","tarifaRegular":2.5,"tarifaReservado":5.0,"capacidadAuto":5,"capacidadMoto":3,"capacidadCamioneta":2}' 403

# Espacios
Test-Endpoint "Listar espacios (publico)" "GET" "$BASE/zonas/api/v1/espacios/" "" "" 200
Test-Endpoint "Listar espacios por zona" "GET" "$BASE/zonas/api/v1/espacios/zona/1" "" "" 200

# ============================================
# FASE 5: TRAZABILIDAD
# ============================================
Write-Host "`n========== FASE 5: TRAZABILIDAD ==========" -ForegroundColor Cyan

Test-Endpoint "Listar asignaciones - admin" "GET" "$BASE/trazabilidad/asignaciones" $adminToken "" 200
Test-Endpoint "Listar asignaciones - propietario" "GET" "$BASE/trazabilidad/asignaciones" $propToken "" 200
Test-Endpoint "Listar asignaciones - empleado" "GET" "$BASE/trazabilidad/asignaciones" $empToken "" 200
Test-Endpoint "Listar asignaciones - sin token" "GET" "$BASE/trazabilidad/asignaciones" "" "" 401

# Historial trazabilidad
Test-Endpoint "Historial trazabilidad - admin" "GET" "$BASE/trazabilidad/trazabilidad/historial" $adminToken "" 200
Test-Endpoint "Historial trazabilidad - empleado (debe fallar)" "GET" "$BASE/trazabilidad/trazabilidad/historial" $empToken "" 403
Test-Endpoint "Historial trazabilidad - propietario (debe fallar)" "GET" "$BASE/trazabilidad/trazabilidad/historial" $propToken "" 403

# ============================================
# FASE 6: TICKETS
# ============================================
Write-Host "`n========== FASE 6: TICKETS ==========" -ForegroundColor Cyan

Test-Endpoint "Listar tickets - admin" "GET" "$BASE/tickets/" $adminToken "" 200
Test-Endpoint "Listar tickets - empleado" "GET" "$BASE/tickets/" $empToken "" 200
Test-Endpoint "Listar tickets - propietario (debe fallar)" "GET" "$BASE/tickets/" $propToken "" 403
Test-Endpoint "Listar tickets - sin token" "GET" "$BASE/tickets/" "" "" 401

# ============================================
# FASE 7: AUDIT
# ============================================
Write-Host "`n========== FASE 7: AUDIT ==========" -ForegroundColor Cyan

Test-Endpoint "Listar eventos audit" "GET" "$BASE/audit/api/v1/audit" "" "" 200

# ============================================
# RESUMEN
# ============================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "RESUMEN DE PRUEBAS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
$total = $results.Count
$passed = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
Write-Host "Total: $total | Pass: $passed | Fail: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })

if ($failed -gt 0) {
    Write-Host "`nFALLOS:" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  #$($_.Test) $($_.Name) - Expected: $($_.Expected), Got: $($_.Actual)" -ForegroundColor Red
    }
}

Write-Host "`nDETALLE COMPLETO:" -ForegroundColor Cyan
$results | Format-Table -AutoSize
