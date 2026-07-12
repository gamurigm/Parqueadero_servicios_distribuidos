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
        [int]$ExpectedStatus = 200
    )
    $script:testNum++
    $headers = @{}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    $headers["Content-Type"] = "application/json"
    
    try {
        $params = @{ Uri = $Url; Method = $Method; Headers = $headers; UseBasicParsing = $true }
        if ($Body) { $params["Body"] = $Body }
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $statusCode = [int]$response.StatusCode
        $content = $response.Content
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $content = ""
        try { $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $content = $reader.ReadToEnd() } catch {}
    }
    
    $pass = ($statusCode -eq $ExpectedStatus)
    $status = if ($pass) { "PASS" } else { "FAIL" }
    $script:results += [PSCustomObject]@{ Test = $script:testNum; Name = $Name; Expected = $ExpectedStatus; Actual = $statusCode; Status = $status; Body = $content }
    $color = if ($pass) { "Green" } else { "Red" }
    Write-Host "[$status] #$($script:testNum) $Name (E:$ExpectedStatus A:$statusCode)" -ForegroundColor $color
    if (-not $pass -and $content) { Write-Host "  -> $($content.Substring(0, [Math]::Min(250, $content.Length)))" -ForegroundColor Gray }
    return $content
}

# ========== TOKENS ==========
Write-Host "`n========== OBTENIENDO TOKENS ==========" -ForegroundColor Cyan
$body = '{"username":"admin1","password":"Admin123!"}'
$adminToken = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token
$body = '{"username":"jcperez2","password":"pass1234"}'
$propToken = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token
$body = '{"username":"emple1","password":"Admin123!"}'
$empToken = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token
$body = '{"username":"jcperez3","password":"pass1234"}'
$suToken = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body $body).access_token
Write-Host "Tokens OK" -ForegroundColor Green

# ================================================================
# FASE 1: PROPIETARIO NO ACTUALIZA ASIGNACIONES
# ================================================================
Write-Host "`n========== FASE 1: PROPIETARIO - ASIGNACIONES (solo lectura) ==========" -ForegroundColor Cyan

# Obtener una asignacion existente para intentar actualizar
$asignaciones = Invoke-RestMethod -Uri "$BASE/trazabilidad/asignaciones" -Method Get -ContentType "application/json" -Headers @{"Authorization"="Bearer $adminToken"}
$asig = $asignaciones | Where-Object { $_.estado -eq 1 } | Select-Object -First 1
$asigUserId = $asig.userId
$asigVehicleId = $asig.vehicleId
Write-Host "Usando asignacion: $asigUserId / $asigVehicleId" -ForegroundColor Gray

Test-Endpoint "propietario listar asignaciones (READ=OK)" "GET" "$BASE/trazabilidad/asignaciones" $propToken "" 200
Test-Endpoint "propietario actualizar asignacion (DEBE SER 403)" "PUT" "$BASE/trazabilidad/asignaciones/$asigUserId/$asigVehicleId" $propToken '{"estado":1,"descripcion":"Intento no autorizado"}' 403
$updateAsigBody = @{estado=1; descripcion="Update admin"} | ConvertTo-Json
Test-Endpoint "admin actualizar asignacion (READ=OK via global)" "PUT" "$BASE/trazabilidad/asignaciones/$asigUserId/$asigVehicleId" $adminToken $updateAsigBody 200
$updateAsigBody2 = @{estado=1; descripcion="Intento empleado"} | ConvertTo-Json
Test-Endpoint "empleado actualizar asignacion (debe fallar 403)" "PUT" "$BASE/trazabilidad/asignaciones/$asigUserId/$asigVehicleId" $empToken $updateAsigBody2 403

# ================================================================
# FASE 2: PROPIETARIO NO VE TICKETS
# ================================================================
Write-Host "`n========== FASE 2: PROPIETARIO - NO VE TICKETS ==========" -ForegroundColor Cyan

Test-Endpoint "admin listar tickets (200)" "GET" "$BASE/tickets/" $adminToken "" 200
Test-Endpoint "empleado listar tickets (200)" "GET" "$BASE/tickets/" $empToken "" 200
Test-Endpoint "super_user listar tickets (200)" "GET" "$BASE/tickets/" $suToken "" 200
Test-Endpoint "propietario listar tickets (DEBE SER 403)" "GET" "$BASE/tickets/" $propToken "" 403
Test-Endpoint "propietario ver ticket por ID (DEBE SER 403)" "GET" "$BASE/tickets/eb3211d7-401f-4839-bb24-816a8b4a9032" $propToken "" 403
Test-Endpoint "propietario ver ticket por codigo (DEBE SER 403)" "GET" "$BASE/tickets/codigo/1253219882690817" $propToken "" 403
Test-Endpoint "sin token listar tickets (401)" "GET" "$BASE/tickets/" "" "" 401

# ================================================================
# FASE 3: ADMIN NO PUEDE ELIMINAR NADA
# ================================================================
Write-Host "`n========== FASE 3: ADMIN NO PUEDE ELIMINAR ==========" -ForegroundColor Cyan

# Obtener IDs para probar
$usuarios = Invoke-RestMethod -Uri "$BASE/usuarios/usuario" -Method Get -ContentType "application/json" -Headers @{"Authorization"="Bearer $adminToken"}
$testUsr = $usuarios | Where-Object { $_.username -eq "testusr1" } | Select-Object -First 1

$vehiculos = Invoke-RestMethod -Uri "$BASE/vehiculos/vehiculos" -Method Get -ContentType "application/json" -Headers @{"Authorization"="Bearer $adminToken"}
$testVeh = $vehiculos | Where-Object { $_.placa -eq "TST-1234" } | Select-Object -First 1

Test-Endpoint "admin eliminar usuario (DEBE SER 403)" "DELETE" "$BASE/usuarios/usuario/1cc19f6a-1557-4685-8416-d3efa0b9cab8" $adminToken "" 403
Test-Endpoint "super_user eliminar usuario (200 o 409)" "DELETE" "$BASE/usuarios/usuario/1cc19f6a-1557-4685-8416-d3efa0b9cab8" $suToken "" 200
Test-Endpoint "admin eliminar vehiculo (DEBE SER 403)" "DELETE" "$BASE/vehiculos/vehiculos/$($testVeh.id)" $adminToken "" 403
Test-Endpoint "super_user eliminar vehiculo (200)" "DELETE" "$BASE/vehiculos/vehiculos/$($testVeh.id)" $suToken "" 200

# Zonas - admin no puede eliminar
$zonas = Invoke-RestMethod -Uri "$BASE/zonas/api/v1/zonas/?page=0&size=1" -Method Get -ContentType "application/json"
$zonaId = $zonas.content[0].idZona
Test-Endpoint "admin eliminar zona (DEBE SER 403)" "DELETE" "$BASE/zonas/api/v1/zonas/$zonaId" $adminToken "" 403
Test-Endpoint "super_user eliminar zona (200 o 409)" "DELETE" "$BASE/zonas/api/v1/zonas/$zonaId" $suToken "" 200

# Asignaciones - admin no puede eliminar
Test-Endpoint "admin eliminar asignacion (DEBE SER 403)" "DELETE" "$BASE/trazabilidad/asignaciones/$asigUserId/$asigVehicleId" $adminToken "" 403
Test-Endpoint "super_user eliminar asignacion (200)" "DELETE" "$BASE/trazabilidad/asignaciones/$asigUserId/$asigVehicleId" $suToken "" 200

# ================================================================
# FASE 4: VALIDACIONES CRUZADAS DE ELIMINACION
# ================================================================
Write-Host "`n========== FASE 4: VALIDACIONES CRUZADAS ==========" -ForegroundColor Cyan

# 4a: No se puede eliminar vehiculo con asignacion activa
# Primero crear una asignacion para un vehiculo nuevo
$body = '{"tipo":"auto","datos":{"placa":"DEL-1234","marca":"Test","modelo":"Delete","color":"Rojo","anio":2024,"clasificacion":"Gasolina","numeroPuertas":4,"capacidadMaletero":400}}'
$nuevoVeh = Invoke-RestMethod -Uri "$BASE/vehiculos/vehiculos" -Method Post -ContentType "application/json" -Body $body -Headers @{"Authorization"="Bearer $adminToken"}
Write-Host "Vehiculo creado para test: $($nuevoVeh.id)" -ForegroundColor Gray

# Obtener propietario ID
$propUserId = (Invoke-RestMethod -Uri "$BASE/usuarios/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"jcperez2","password":"pass1234"}').user.id
$bodyAsig = @{userId=$propUserId; vehicleId=$nuevoVeh.id; descripcion="Test cross-validation"} | ConvertTo-Json
$asigCreada = Invoke-RestMethod -Uri "$BASE/trazabilidad/asignaciones" -Method Post -ContentType "application/json" -Body $bodyAsig -Headers @{"Authorization"="Bearer $empToken"}
Write-Host "Asignacion creada para test de validacion cruzada" -ForegroundColor Gray

# Intentar eliminar vehiculo con asignacion activa - debe fallar
Test-Endpoint "eliminar vehiculo con asignacion activa (DEBE SER 409)" "DELETE" "$BASE/vehiculos/vehiculos/$($nuevoVeh.id)" $suToken "" 409

# Eliminar la asignacion primero
Test-Endpoint "eliminar asignacion para liberar vehiculo (200)" "DELETE" "$BASE/trazabilidad/asignaciones/$propUserId/$($nuevoVeh.id)" $suToken "" 200

# Ahora si se puede eliminar el vehiculo
Test-Endpoint "eliminar vehiculo sin asignacion (200)" "DELETE" "$BASE/vehiculos/vehiculos/$($nuevoVeh.id)" $suToken "" 200

# 4b: No se puede eliminar zona con espacios asignados
Test-Endpoint "eliminar zona con espacios (DEBE SER 409)" "DELETE" "$BASE/zonas/api/v1/zonas/$zonaId" $suToken "" 409

# ================================================================
# FASE 5: ADMIN CRUD COMPLETO (sin delete)
# ================================================================
Write-Host "`n========== FASE 5: ADMIN CRUD (sin delete) ==========" -ForegroundColor Cyan

Test-Endpoint "admin listar usuarios (200)" "GET" "$BASE/usuarios/usuario" $adminToken "" 200
Test-Endpoint "admin listar personas (200)" "GET" "$BASE/usuarios/persona" $adminToken "" 200
Test-Endpoint "admin listar roles (200)" "GET" "$BASE/usuarios/roles" $adminToken "" 200
Test-Endpoint "admin listar vehiculos (200)" "GET" "$BASE/vehiculos/vehiculos" $adminToken "" 200
Test-Endpoint "admin listar zonas (200)" "GET" "$BASE/zonas/api/v1/zonas/" $adminToken "" 200
Test-Endpoint "admin listar espacios (200)" "GET" "$BASE/zonas/api/v1/espacios/" $adminToken "" 200
Test-Endpoint "admin listar asignaciones (200)" "GET" "$BASE/trazabilidad/asignaciones" $adminToken "" 200
Test-Endpoint "admin listar tickets (200)" "GET" "$BASE/tickets/" $adminToken "" 200
Test-Endpoint "admin historial trazabilidad (200)" "GET" "$BASE/trazabilidad/trazabilidad/historial" $adminToken "" 200
Test-Endpoint "admin activar/desactivar usuario (200 o 409)" "PATCH" "$BASE/usuarios/usuario/1742cc7e-45aa-47e9-81d2-0270e2cf0bff/activar-desactivar" $adminToken "" 200
Test-Endpoint "admin crear vehiculo (201)" "POST" "$BASE/vehiculos/vehiculos" $adminToken '{"tipo":"auto","datos":{"placa":"ADM-9999","marca":"Admin","modelo":"Test","color":"Verde","anio":2024,"clasificacion":"Gasolina","numeroPuertas":4,"capacidadMaletero":400}}' 201

# ================================================================
# FASE 6: AUDIT - TODOS LOS MICROSERVICIOS
# ================================================================
Write-Host "`n========== FASE 6: AUDIT - TODOS LOS MICROSERVICIOS ==========" -ForegroundColor Cyan

# Obtener audit events
$auditEvents = Invoke-RestMethod -Uri "$BASE/audit/api/v1/audit" -Method Get -ContentType "application/json"
$auditCount = $auditEvents.Count
Write-Host "Total eventos de auditoria: $auditCount" -ForegroundColor Gray

# Contar por servicio
$services = $auditEvents | Group-Object -Property servicio
foreach ($svc in $services) {
    Write-Host "  $($svc.Name): $($svc.Count) eventos" -ForegroundColor Gray
}

# Verificar servicios esperados
$expectedServices = @("ms-usuarios", "ms-vehiculos", "ms-tickets", "ms-trazabilidad", "ms-zonas")
$actualServices = $services | Select-Object -ExpandProperty Name
foreach ($svc in $expectedServices) {
    $found = $actualServices -contains $svc
    $emoji = if($found){"[OK]"}else{"[FALTA]"}
    $color = if($found){"Green"}else{"Yellow"}
    Write-Host "  $emoji Servicio '$svc': $found" -ForegroundColor $color
}

# Verificar tipos de accion
$acciones = $auditEvents | Group-Object -Property accion
Write-Host "`nTipos de accion:" -ForegroundColor Gray
foreach ($acc in $acciones) {
    Write-Host "  $($acc.Name): $($acc.Count)" -ForegroundColor Gray
}

# Verificar entidades
$entidades = $auditEvents | Group-Object -Property entidad
Write-Host "`nEntidades auditadas:" -ForegroundColor Gray
foreach ($ent in $entidades) {
    Write-Host "  $($ent.Name): $($ent.Count)" -ForegroundColor Gray
}

# Verificar campos de integridad en eventos recientes
Write-Host "`nVerificacion de campos en eventos:" -ForegroundColor Gray
$requiredFields = @("servicio", "accion", "entidad", "datos", "timestamp")
$sampleEvents = $auditEvents | Select-Object -First 5
$allFieldsPresent = $true
foreach ($evt in $sampleEvents) {
    foreach ($f in $requiredFields) {
        $has = $evt.PSObject.Properties.Name -contains $f
        if (-not $has) {
            Write-Host "  [FALTA] Evento $($evt.id) no tiene campo '$f'" -ForegroundColor Red
            $allFieldsPresent = $false
        }
    }
}
if ($allFieldsPresent) {
    Write-Host "  [OK] Todos los eventos tienen los campos requeridos" -ForegroundColor Green
}

# Verificar que los eventos de zonas existen (Spring Boot)
$zonasEvents = $auditEvents | Where-Object { $_.servicio -eq "ms-zonas" }
if ($zonasEvents.Count -gt 0) {
    Write-Host "  [OK] Eventos de zonas encontrados: $($zonasEvents.Count)" -ForegroundColor Green
    Write-Host "  Sample: $($zonasEvents[0] | ConvertTo-Json -Compress -Depth 2)" -ForegroundColor Gray
} else {
    Write-Host "  [INFO] No hay eventos de zonas todavia (Spring Boot puede no enviar a RabbitMQ)" -ForegroundColor Yellow
}

# Verificar eventos de trazabilidad
$trazEvents = $auditEvents | Where-Object { $_.servicio -eq "ms-trazabilidad" }
if ($trazEvents.Count -gt 0) {
    Write-Host "  [OK] Eventos de trazabilidad encontrados: $($trazEvents.Count)" -ForegroundColor Green
} else {
    Write-Host "  [INFO] No hay eventos de trazabilidad en audit (trazabilidad usa su propia tabla)" -ForegroundColor Yellow
}

# Verificar eventos de tickets
$ticketsEvents = $auditEvents | Where-Object { $_.servicio -eq "ms-tickets" }
if ($ticketsEvents.Count -gt 0) {
    Write-Host "  [OK] Eventos de tickets encontrados: $($ticketsEvents.Count)" -ForegroundColor Green
} else {
    Write-Host "  [INFO] No hay eventos de tickets en audit (generar ticket para verificar)" -ForegroundColor Yellow
}

# ================================================================
# FASE 7: EMITIR TICKET Y VERIFICAR AUDIT
# ================================================================
Write-Host "`n========== FASE 7: EMITIR TICKET + VERIFICAR AUDIT ==========" -ForegroundColor Cyan

# Obtener un espacio disponible
$espacios = Invoke-RestMethod -Uri "$BASE/zonas/api/v1/espacios/" -Method Get -ContentType "application/json"
$espacioLibre = $espacios | Where-Object { $_.estado -eq "DISPONIBLE" -and $_.activo -eq $true } | Select-Object -First 1

if ($espacioLibre) {
    Write-Host "Espacio disponible: $($espacioLibre.codigo) en zona $($espacioLibre.nombreZona)" -ForegroundColor Gray
    
    # Emitir ticket
    $bodyEmitir = @{idEspacio=$espacioLibre.id; cedula="1000000003"; placa="PBC-1234"} | ConvertTo-Json
    try {
        $ticket = Invoke-RestMethod -Uri "$BASE/tickets/emitir" -Method Post -ContentType "application/json" -Body $bodyEmitir -Headers @{"Authorization"="Bearer $empToken"}
        Write-Host "Ticket emitido: $($ticket.codigoTicket)" -ForegroundColor Green
        
        # Pagar ticket
        $bodyPagar = @{idTicket=$ticket.id} | ConvertTo-Json
        $pago = Invoke-RestMethod -Uri "$BASE/tickets/pagar" -Method Post -ContentType "application/json" -Body $bodyPagar -Headers @{"Authorization"="Bearer $empToken"}
        Write-Host "Ticket pagado: $($pago.codigoTicket)" -ForegroundColor Green
        
        # Verificar audit de tickets
        Start-Sleep -Seconds 2
        $auditAfter = Invoke-RestMethod -Uri "$BASE/audit/api/v1/audit" -Method Get -ContentType "application/json"
        $ticketsAudit = $auditAfter | Where-Object { $_.servicio -eq "ms-tickets" }
        if ($ticketsAudit.Count -gt 0) {
            Write-Host "[OK] Eventos de tickets en audit: $($ticketsAudit.Count)" -ForegroundColor Green
            foreach ($evt in $ticketsAudit) {
                Write-Host "  $($evt.accion) - $($evt.entidad) - $($evt.datos | ConvertTo-Json -Compress -Depth 1)" -ForegroundColor Gray
            }
        } else {
            Write-Host "[WARN] No se encontraron eventos de tickets en audit" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Error al emitir/pagar ticket: $_" -ForegroundColor Red
    }
} else {
    Write-Host "No hay espacios disponibles para test de tickets" -ForegroundColor Yellow
}

# ================================================================
# RESUMEN
# ================================================================
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "RESUMEN FINAL DE PRUEBAS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
$total = $results.Count
$passed = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
Write-Host "Total: $total | Pass: $passed | Fail: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })

if ($failed -gt 0) {
    Write-Host "`nFALLOS:" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  #$($_.Test) $($_.Name) - E:$($_.Expected) A:$($_.Actual)" -ForegroundColor Red
    }
}

Write-Host "`nTODOS LOS PASARON:" -ForegroundColor Green
$results | Where-Object { $_.Status -eq "PASS" } | ForEach-Object {
    Write-Host "  #$($_.Test) $($_.Name)" -ForegroundColor Green
}
