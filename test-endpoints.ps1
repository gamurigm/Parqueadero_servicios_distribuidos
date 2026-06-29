# ====================================================================
# SCRIPT DE PRUEBAS - Todos los endpoints con casos válidos e inválidos
# Ejecutar: powershell -ExecutionPolicy Bypass -File test-endpoints.ps1
# ====================================================================

$BASE_USUARIOS = "http://localhost:5000"
$BASE_VEHICULOS = "http://localhost:3000"
$BASE_ZONAS = "http://localhost:8080/api/v1"

$PASS = 0
$FAIL = 0

function Test-Case {
    param([string]$Name, [string]$Method, [string]$Url, [string]$Body, [string[]]$ExpectedCodes)
    $code = $null
    try {
        if ($Method -eq "GET" -or $Method -eq "DELETE") {
            $r = Invoke-WebRequest -Uri $Url -Method $Method -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
            $code = $r.StatusCode
        } else {
            $r = Invoke-WebRequest -Uri $Url -Method $Method -Body $Body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
            $code = $r.StatusCode
        }
    } catch {
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
        } else {
            $code = 0
        }
    }
    $expectedStr = "$ExpectedCodes"
    if ($ExpectedCodes -contains $code) {
        Write-Host "[PASS] $Name -> $code" -ForegroundColor Green
        $script:PASS++
    } else {
        Write-Host "[FAIL] $Name -> $code (esperado: $expectedStr)" -ForegroundColor Red
        $script:FAIL++
    }
    Start-Sleep -Milliseconds 300
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRUEBAS DE ENDPOINTS - TODOS LOS MICROSERVICIOS" -ForegroundColor Cyan
Write-Host "  Swagger UI: http://localhost:8085" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ====================================================================
# 1. GESTIÓN USUARIOS (NestJS :5000)
# ====================================================================
Write-Host "========== USUARIOS ==========" -ForegroundColor Yellow

# --- Health Check ---
Write-Host "--- Health ---" -ForegroundColor Magenta
Test-Case -Name "GET / health check" -Method GET -Url "$BASE_USUARIOS/" -ExpectedCodes @(200)

# --- Persona ---
Write-Host "--- PERSONA ---" -ForegroundColor Magenta

# CREATE Persona - VÁLIDO
Test-Case -Name "CREATE persona VÁLIDO" -Method POST -Url "$BASE_USUARIOS/persona" -Body '{
    "firstName": "Juan",
    "middleName": "Carlos",
    "lastName": "Pérez",
    "dni": "1234567890",
    "email": "juan.perez@example.com",
    "address": "Av. Siempre Viva 123, Quito",
    "nationality": "Ecuatoriana",
    "phone": "0999999999",
    "tipo": "natural"
}' -ExpectedCodes @(201)

# CREATE Persona - INVÁLIDO (dni con letras)
Test-Case -Name "CREATE persona INVALID dni con letras" -Method POST -Url "$BASE_USUARIOS/persona" -Body '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "dni": "123456789A",
    "email": "juan2@example.com",
    "address": "Av. Siempre Viva 123, Quito",
    "nationality": "Ecuatoriana",
    "phone": "0999999998",
    "tipo": "natural"
}' -ExpectedCodes @(400)

# CREATE Persona - INVÁLIDO (email malo)
Test-Case -Name "CREATE persona INVALID email" -Method POST -Url "$BASE_USUARIOS/persona" -Body '{
    "firstName": "Maria",
    "lastName": "López",
    "dni": "9876543210",
    "email": "esto-no-es-un-email",
    "address": "Av. Principal 456, Guayaquil",
    "nationality": "Ecuatoriana",
    "phone": "0988888888",
    "tipo": "natural"
}' -ExpectedCodes @(400)

# CREATE Persona - INVÁLIDO (firstName con numeros)
Test-Case -Name "CREATE persona INVALID firstName numeros" -Method POST -Url "$BASE_USUARIOS/persona" -Body '{
    "firstName": "Juan123",
    "lastName": "Pérez",
    "dni": "1112223334",
    "email": "juan3@example.com",
    "address": "Av. Siempre Viva 123, Quito",
    "nationality": "Ecuatoriana",
    "phone": "0977777777",
    "tipo": "natural"
}' -ExpectedCodes @(400)

# CREATE Persona - INVÁLIDO (phone menor a 10 dígitos)
Test-Case -Name "CREATE persona INVALID phone corto" -Method POST -Url "$BASE_USUARIOS/persona" -Body '{
    "firstName": "Carlos",
    "lastName": "Gómez",
    "dni": "5556667778",
    "email": "carlos@example.com",
    "address": "Calle Falsa 123, Cuenca",
    "nationality": "Ecuatoriana",
    "phone": "09999",
    "tipo": "natural"
}' -ExpectedCodes @(400)

# CREATE Persona - INVÁLIDO (tipo incorrecto)
Test-Case -Name "CREATE persona INVALID tipo incorrecto" -Method POST -Url "$BASE_USUARIOS/persona" -Body '{
    "firstName": "Ana",
    "lastName": "Martínez",
    "dni": "4445556667",
    "email": "ana@example.com",
    "address": "Calle 123, Loja",
    "nationality": "Ecuatoriana",
    "phone": "0966666666",
    "tipo": "alien"
}' -ExpectedCodes @(400)

# CREATE Persona - INVÁLIDO (campos vacíos)
Test-Case -Name "CREATE persona INVALID campos vacios" -Method POST -Url "$BASE_USUARIOS/persona" -Body '{
    "firstName": "",
    "lastName": "",
    "dni": "",
    "email": "",
    "address": "",
    "nationality": "",
    "phone": "",
    "tipo": ""
}' -ExpectedCodes @(400)

# CREATE Persona - INVÁLIDO (XSS/inyección en nombre)
Test-Case -Name "CREATE persona INVALID XSS injection" -Method POST -Url "$BASE_USUARIOS/persona" -Body '{
    "firstName": "<script>alert(1)</script>",
    "lastName": "Pérez",
    "dni": "7778889990",
    "email": "xss@example.com",
    "address": "Av. Segura 456, Quito",
    "nationality": "Ecuatoriana",
    "phone": "0955555555",
    "tipo": "natural"
}' -ExpectedCodes @(400)

# GET Personas
Test-Case -Name "GET listar personas" -Method GET -Url "$BASE_USUARIOS/persona" -ExpectedCodes @(200)

# --- Usuario ---
Write-Host "--- USUARIO ---" -ForegroundColor Magenta

# CREATE Usuario - VÁLIDO
Test-Case -Name "CREATE usuario VÁLIDO" -Method POST -Url "$BASE_USUARIOS/usuario" -Body '{
    "username": "jperez",
    "password": "Passw0rd!123"
}' -ExpectedCodes @(201)

# CREATE Usuario - INVÁLIDO (username > 10 chars)
Test-Case -Name "CREATE usuario INVALID username largo" -Method POST -Url "$BASE_USUARIOS/usuario" -Body '{
    "username": "username_muy_largo",
    "password": "Passw0rd!123"
}' -ExpectedCodes @(400)

# CREATE Usuario - INVÁLIDO (username vacío)
Test-Case -Name "CREATE usuario INVALID username vacio" -Method POST -Url "$BASE_USUARIOS/usuario" -Body '{
    "username": "",
    "password": "Passw0rd!123"
}' -ExpectedCodes @(400)

# CREATE Usuario - INVÁLIDO (password < 8 chars)
Test-Case -Name "CREATE usuario INVALID password corta" -Method POST -Url "$BASE_USUARIOS/usuario" -Body '{
    "username": "testuser",
    "password": "123"
}' -ExpectedCodes @(400)

# CREATE Usuario - INVÁLIDO (username con espacios/inyección)
Test-Case -Name "CREATE usuario INVALID username inyeccion" -Method POST -Url "$BASE_USUARIOS/usuario" -Body '{
    "username": "admin; DROP",
    "password": "Passw0rd!123"
}' -ExpectedCodes @(400)

# GET Usuarios
Test-Case -Name "GET listar usuarios" -Method GET -Url "$BASE_USUARIOS/usuario" -ExpectedCodes @(200)

# --- Roles ---
Write-Host "--- ROLES ---" -ForegroundColor Magenta

# CREATE Rol - VÁLIDO
Test-Case -Name "CREATE rol VÁLIDO" -Method POST -Url "$BASE_USUARIOS/roles" -Body '{
    "nombre": "Administrador",
    "descripcion": "Rol con acceso total al sistema"
}' -ExpectedCodes @(201)

# CREATE Rol - INVÁLIDO (nombre < 2 chars)
Test-Case -Name "CREATE rol INVALID nombre corto" -Method POST -Url "$BASE_USUARIOS/roles" -Body '{
    "nombre": "A",
    "descripcion": "Rol inválido"
}' -ExpectedCodes @(400)

# CREATE Rol - INVÁLIDO (nombre > 50 chars)
Test-Case -Name "CREATE rol INVALID nombre largo" -Method POST -Url "$BASE_USUARIOS/roles" -Body '{
    "nombre": "EsteNombreDeRolEsDemasiadoLargoParaSerValido1234567890",
    "descripcion": "Rol inválido"
}' -ExpectedCodes @(400)

# CREATE Rol - INVÁLIDO (campos vacíos)
Test-Case -Name "CREATE rol INVALID campos vacios" -Method POST -Url "$BASE_USUARIOS/roles" -Body '{
    "nombre": "",
    "descripcion": ""
}' -ExpectedCodes @(400)

# GET Roles
Test-Case -Name "GET listar roles" -Method GET -Url "$BASE_USUARIOS/roles" -ExpectedCodes @(200)

# --- Roles-Usuario ---
Write-Host "--- ROLES-USUARIO ---" -ForegroundColor Magenta

# CREATE RolesUsuario - INVÁLIDO (UUIDs inválidos)
Test-Case -Name "CREATE roles-usuario INVALID UUIDs" -Method POST -Url "$BASE_USUARIOS/roles-Usuario" -Body '{
    "id_user": "no-es-uuid",
    "id_rol": "tampoco-es-uuid"
}' -ExpectedCodes @(400)

# GET RolesUsuario
Test-Case -Name "GET listar roles-usuario" -Method GET -Url "$BASE_USUARIOS/roles-Usuario" -ExpectedCodes @(200)

# ====================================================================
# 2. VEHÍCULOS (NestJS :3000)
# ====================================================================
Write-Host "`n========== VEHÍCULOS ==========" -ForegroundColor Yellow

# --- Health Check ---
Test-Case -Name "GET / health check vehiculos" -Method GET -Url "$BASE_VEHICULOS/" -ExpectedCodes @(200)

# CREATE Auto - VÁLIDO
Test-Case -Name "CREATE auto VÁLIDO" -Method POST -Url "$BASE_VEHICULOS/vehiculos" -Body '{
    "tipo": "auto",
    "datos": {
        "placa": "ABC-1234",
        "marca": "Toyota",
        "modelo": "Corolla",
        "color": "Rojo",
        "anio": 2022,
        "clasificacion": "GASOLINA",
        "numeroPuertas": 4,
        "capacidadMaletero": 450
    }
}' -ExpectedCodes @(201)

# CREATE Auto - INVÁLIDO (placa formato incorrecto)
Test-Case -Name "CREATE auto INVALID placa formato" -Method POST -Url "$BASE_VEHICULOS/vehiculos" -Body '{
    "tipo": "auto",
    "datos": {
        "placa": "12345",
        "marca": "Toyota",
        "modelo": "Corolla",
        "color": "Rojo",
        "anio": 2022,
        "clasificacion": "GASOLINA",
        "numeroPuertas": 4,
        "capacidadMaletero": 450
    }
}' -ExpectedCodes @(400)

# CREATE Auto - INVÁLIDO (año anterior a 1885)
Test-Case -Name "CREATE auto INVALID anio antiguo" -Method POST -Url "$BASE_VEHICULOS/vehiculos" -Body '{
    "tipo": "auto",
    "datos": {
        "placa": "XYZ-5678",
        "marca": "Ford",
        "modelo": "Model T",
        "color": "Negro",
        "anio": 1800,
        "clasificacion": "GASOLINA",
        "numeroPuertas": 2,
        "capacidadMaletero": 100
    }
}' -ExpectedCodes @(400)

# CREATE Auto - INVÁLIDO (puertas fuera de rango)
Test-Case -Name "CREATE auto INVALID puertas fuera rango" -Method POST -Url "$BASE_VEHICULOS/vehiculos" -Body '{
    "tipo": "auto",
    "datos": {
        "placa": "DEF-9012",
        "marca": "Chevrolet",
        "modelo": "Sail",
        "color": "Azul",
        "anio": 2020,
        "clasificacion": "GASOLINA",
        "numeroPuertas": 10,
        "capacidadMaletero": 300
    }
}' -ExpectedCodes @(400)

# CREATE Auto - INVÁLIDO (marca con números)
Test-Case -Name "CREATE auto INVALID marca numeros" -Method POST -Url "$BASE_VEHICULOS/vehiculos" -Body '{
    "tipo": "auto",
    "datos": {
        "placa": "GHI-3456",
        "marca": "Toyota 2024",
        "modelo": "Corolla",
        "color": "Blanco",
        "anio": 2024,
        "clasificacion": "HIBRIDO",
        "numeroPuertas": 4,
        "capacidadMaletero": 400
    }
}' -ExpectedCodes @(400)

# CREATE Auto - INVÁLIDO (clasificacion incorrecta)
Test-Case -Name "CREATE auto INVALID clasificacion" -Method POST -Url "$BASE_VEHICULOS/vehiculos" -Body '{
    "tipo": "auto",
    "datos": {
        "placa": "JKL-7890",
        "marca": "Honda",
        "modelo": "Civic",
        "color": "Gris",
        "anio": 2023,
        "clasificacion": "NO_EXISTE",
        "numeroPuertas": 4,
        "capacidadMaletero": 350
    }
}' -ExpectedCodes @(400)

# CREATE Motocicleta - VÁLIDO
Test-Case -Name "CREATE motocicleta VÁLIDO" -Method POST -Url "$BASE_VEHICULOS/vehiculos" -Body '{
    "tipo": "motocicleta",
    "datos": {
        "placa": "GG-420A",
        "marca": "Yamaha",
        "modelo": "MT-07",
        "color": "Negro",
        "anio": 2023,
        "clasificacion": "GASOLINA",
        "tipo": "DEPORTIVA"
    }
}' -ExpectedCodes @(201)

# CREATE Motocicleta - INVÁLIDO (placa moto formato incorrecto)
Test-Case -Name "CREATE moto INVALID placa formato auto" -Method POST -Url "$BASE_VEHICULOS/vehiculos" -Body '{
    "tipo": "motocicleta",
    "datos": {
        "placa": "ABC-1234",
        "marca": "Yamaha",
        "modelo": "MT-07",
        "color": "Negro",
        "anio": 2023,
        "clasificacion": "GASOLINA",
        "tipo": "DEPORTIVA"
    }
}' -ExpectedCodes @(400)

# CREATE Camioneta - VÁLIDO
Test-Case -Name "CREATE camioneta VÁLIDO" -Method POST -Url "$BASE_VEHICULOS/vehiculos" -Body '{
    "tipo": "camioneta",
    "datos": {
        "placa": "LMN-9012",
        "marca": "Chevrolet",
        "modelo": "Luv D-Max",
        "color": "Blanco",
        "anio": 2024,
        "clasificacion": "DIESEL",
        "cabina": "Cabina doble full equipo",
        "capacidadCarga": 1500
    }
}' -ExpectedCodes @(201)

# CREATE Camioneta - INVÁLIDO (capacidadCarga negativa)
Test-Case -Name "CREATE camioneta INVALID carga negativa" -Method POST -Url "$BASE_VEHICULOS/vehiculos" -Body '{
    "tipo": "camioneta",
    "datos": {
        "placa": "NOP-3456",
        "marca": "Ford",
        "modelo": "Ranger",
        "color": "Azul",
        "anio": 2023,
        "clasificacion": "DIESEL",
        "cabina": "Cabina sencilla trabajo",
        "capacidadCarga": -500
    }
}' -ExpectedCodes @(400)

# CREATE Vehículo - INVÁLIDO (tipo no existe)
Test-Case -Name "CREATE vehiculo INVALID tipo inexistente" -Method POST -Url "$BASE_VEHICULOS/vehiculos" -Body '{
    "tipo": "triciclo",
    "datos": {}
}' -ExpectedCodes @(400)

# CREATE Vehículo - INVÁLIDO (cuerpo vacío)
Test-Case -Name "CREATE vehiculo INVALID body vacio" -Method POST -Url "$BASE_VEHICULOS/vehiculos" -Body '{}' -ExpectedCodes @(400)

# GET Vehículos
Test-Case -Name "GET listar vehiculos" -Method GET -Url "$BASE_VEHICULOS/vehiculos" -ExpectedCodes @(200)

# GET Vehículo por ID - INVÁLIDO (ID no existe)
Test-Case -Name "GET vehiculo INVALID id inexistente" -Method GET -Url "$BASE_VEHICULOS/vehiculos/99999" -ExpectedCodes @(404)

# ====================================================================
# 3. ZONAS (Spring Boot :8080/api/v1)
# ====================================================================
Write-Host "`n========== ZONAS ==========" -ForegroundColor Yellow

# CREATE Zona - VÁLIDO
Test-Case -Name "CREATE zona VÁLIDO" -Method POST -Url "$BASE_ZONAS/zonas/" -Body '{
    "nombre": "Zona VIP Central",
    "descripcion": "Zona vip cerca del escenario principal",
    "tipoZona": "VIP",
    "capacidad": 50
}' -ExpectedCodes @(201)

# CREATE Zona - INVÁLIDO (nombre < 3 chars)
Test-Case -Name "CREATE zona INVALID nombre corto" -Method POST -Url "$BASE_ZONAS/zonas/" -Body '{
    "nombre": "AB",
    "descripcion": "Zona inválida",
    "tipoZona": "REGULAR",
    "capacidad": 10
}' -ExpectedCodes @(400)

# CREATE Zona - INVÁLIDO (nombre > 32 chars)
Test-Case -Name "CREATE zona INVALID nombre largo" -Method POST -Url "$BASE_ZONAS/zonas/" -Body '{
    "nombre": "ZonaConNombreDemasiadoLargoParaSerValidoEnElSistema",
    "descripcion": "Zona inválida",
    "tipoZona": "REGULAR",
    "capacidad": 10
}' -ExpectedCodes @(400)

# CREATE Zona - INVÁLIDO (capacidad < 1)
Test-Case -Name "CREATE zona INVALID capacidad cero" -Method POST -Url "$BASE_ZONAS/zonas/" -Body '{
    "nombre": "Zona Invalida",
    "descripcion": "Zona con capacidad 0",
    "tipoZona": "REGULAR",
    "capacidad": 0
}' -ExpectedCodes @(400)

# CREATE Zona - INVÁLIDO (capacidad > 100)
Test-Case -Name "CREATE zona INVALID capacidad > 100" -Method POST -Url "$BASE_ZONAS/zonas/" -Body '{
    "nombre": "Zona Mega",
    "descripcion": "Zona con capacidad excesiva",
    "tipoZona": "REGULAR",
    "capacidad": 999
}' -ExpectedCodes @(400)

# CREATE Zona - INVÁLIDO (tipoZona incorrecto)
Test-Case -Name "CREATE zona INVALID tipoZona" -Method POST -Url "$BASE_ZONAS/zonas/" -Body '{
    "nombre": "Zona Prueba",
    "descripcion": "Zona de prueba",
    "tipoZona": "ULTRA_VIP",
    "capacidad": 20
}' -ExpectedCodes @(400)

# CREATE Zona - INVÁLIDO (nombre con símbolos especiales)
Test-Case -Name "CREATE zona INVALID nombre simbolos" -Method POST -Url "$BASE_ZONAS/zonas/" -Body '{
    "nombre": "Zona $$$ VIP",
    "descripcion": "Zona inválida",
    "tipoZona": "REGULAR",
    "capacidad": 10
}' -ExpectedCodes @(400)

# CREATE Zona - INVÁLIDO (XSS en descripción)
Test-Case -Name "CREATE zona INVALID XSS descripcion" -Method POST -Url "$BASE_ZONAS/zonas/" -Body '{
    "nombre": "Zona Segura",
    "descripcion": "<script>alert(1)</script>",
    "tipoZona": "REGULAR",
    "capacidad": 10
}' -ExpectedCodes @(400)

# CREATE Zona - INVÁLIDO (campos nulos)
Test-Case -Name "CREATE zona INVALID body vacio" -Method POST -Url "$BASE_ZONAS/zonas/" -Body '{}' -ExpectedCodes @(400)

# GET Zonas
Test-Case -Name "GET listar zonas" -Method GET -Url "$BASE_ZONAS/zonas/" -ExpectedCodes @(200)

# --- Espacios ---
Write-Host "--- ESPACIOS ---" -ForegroundColor Magenta

# CREATE Espacio - INVÁLIDO (idZona UUID inválido)
Test-Case -Name "CREATE espacio INVALID idZona" -Method POST -Url "$BASE_ZONAS/espacios/" -Body '{
    "idZona": "no-es-uuid",
    "descripcion": "Espacio A1",
    "tipoEspacio": "AUTO"
}' -ExpectedCodes @(400)

# CREATE Espacio - INVÁLIDO (tipoEspacio incorrecto)
Test-Case -Name "CREATE espacio INVALID tipoEspacio" -Method POST -Url "$BASE_ZONAS/espacios/" -Body '{
    "idZona": "00000000-0000-0000-0000-000000000000",
    "descripcion": "Espacio inválido",
    "tipoEspacio": "AVION"
}' -ExpectedCodes @(400)

# CREATE Espacio - INVÁLIDO (descripcion muy larga > 200)
$descripcionLarga = "A" * 250
$body = '{
    "idZona": "00000000-0000-0000-0000-000000000000",
    "descripcion": "' + $descripcionLarga + '",
    "tipoEspacio": "AUTO"
}'
Test-Case -Name "CREATE espacio INVALID descripcion larga" -Method POST -Url "$BASE_ZONAS/espacios/" -Body $body -ExpectedCodes @(400)

# CREATE Espacio - INVÁLIDO (body vacío)
Test-Case -Name "CREATE espacio INVALID body vacio" -Method POST -Url "$BASE_ZONAS/espacios/" -Body '{}' -ExpectedCodes @(400)

# GET Espacios
Test-Case -Name "GET listar espacios" -Method GET -Url "$BASE_ZONAS/espacios/" -ExpectedCodes @(200)

# GET Espacios por zona - INVÁLIDO (zona UUID inexistente)
Test-Case -Name "GET espacios INVALID zona uuid" -Method GET -Url "$BASE_ZONAS/espacios/zona/00000000-0000-0000-0000-000000000000" -ExpectedCodes @(404)

# ====================================================================
# RESULTADOS
# ====================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RESULTADOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PASARON: $PASS" -ForegroundColor Green
Write-Host "  FALLARON: $FAIL" -ForegroundColor Red
Write-Host "  TOTAL: ($($PASS + $FAIL))" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nSwagger UI: http://localhost:8085" -ForegroundColor Cyan
Write-Host ""
