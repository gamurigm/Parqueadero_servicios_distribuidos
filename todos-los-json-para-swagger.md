# TODOS LOS JSONs PARA PROBAR EN SWAGGER UI
## Swagger: http://localhost:8085

---

# ==========================================
# 1. GESTIÓN USUARIOS (http://localhost:5000)
# ==========================================

## 1.1 PERSONA (/persona)

### POST /persona — CREAR PERSONA

**VÁLIDO ✅**
```json
{
  "firstName": "Juan",
  "middleName": "Carlos",
  "lastName": "Pérez",
  "dni": "1234567890",
  "email": "juan.perez@email.com",
  "address": "Av. Siempre Viva 123, Quito",
  "nationality": "Ecuatoriana",
  "phone": "0987654321",
  "tipo": "natural"
}
```

**INVÁLIDOS ❌**

| # | Qué prueba | JSON |
|---|-----------|------|
| 1 | **DNI con letras** | `{"firstName":"Juan","middleName":"","lastName":"Pérez","dni":"123456789A","email":"juan2@email.com","address":"Calle 123","nationality":"Ecuatoriana","phone":"0987654322","tipo":"natural"}` |
| 2 | **Email inválido** | `{"firstName":"María","middleName":"","lastName":"López","dni":"9876543210","email":"esto-no-es-email","address":"Av. Principal 456","nationality":"Ecuatoriana","phone":"0988888888","tipo":"natural"}` |
| 3 | **Nombre con números** | `{"firstName":"Juan123","middleName":"","lastName":"Pérez","dni":"1112223334","email":"juan3@email.com","address":"Calle Falsa 123","nationality":"Ecuatoriana","phone":"0977777777","tipo":"natural"}` |
| 4 | **Phone < 10 dígitos** | `{"firstName":"Carlos","middleName":"","lastName":"Gómez","dni":"5556667778","email":"carlos@email.com","address":"Av. 12 de Octubre","nationality":"Ecuatoriana","phone":"09999","tipo":"natural"}` |
| 5 | **Tipo con caracteres inválidos** | `{"firstName":"Ana","middleName":"","lastName":"Martínez","dni":"4445556667","email":"ana@email.com","address":"Calle 123","nationality":"Ecuatoriana","phone":"0966666666","tipo":"cliente123"}` |
| 6 | **Campos vacíos** | `{"firstName":"","middleName":"","lastName":"","dni":"","email":"","address":"","nationality":"","phone":"","tipo":""}` |
| 7 | **XSS / Inyección** | `{"firstName":"<script>alert(1)</script>","middleName":"","lastName":"Pérez","dni":"7778889990","email":"xss@email.com","address":"Av. Segura 456","nationality":"Ecuatoriana","phone":"0955555555","tipo":"natural"}` |

### GET /persona — LISTAR PERSONAS (sin body)

### GET /persona/{id} — OBTENER PERSONA POR ID (sin body, solo path param)

### PUT /persona/{id} — ACTUALIZAR PERSONA

**VÁLIDO ✅** (todos opcionales, solo envías lo que cambias)
```json
{
  "firstName": "Juan Actualizado",
  "phone": "0999999999"
}
```

**INVÁLIDOS ❌**

| # | JSON |
|---|------|
| 1 | `{"firstName":"Nombre123"}` |
| 2 | `{"dni":"12345"}` |
| 3 | `{"email":"email-malo"}` |
| 4 | `{"phone":"abc"}` |

### PATCH /persona/{id}/cambio-de-estado — CAMBIAR ESTADO (sin body, solo path param)

### DELETE /persona/{id} — ELIMINAR PERSONA (sin body, solo path param)

---

## 1.2 USUARIO (/usuario)

### POST /usuario — CREAR USUARIO

**VÁLIDO ✅**
```json
{
  "username": "jperez",
  "password": "Password123"
}
```

**INVÁLIDOS ❌**

| # | Qué prueba | JSON |
|---|-----------|------|
| 1 | **Username > 10 chars** | `{"username":"username_muy_largo","password":"Password123"}` |
| 2 | **Username vacío** | `{"username":"","password":"Password123"}` |
| 3 | **Password < 8 chars** | `{"username":"testuser","password":"123"}` |
| 4 | **Username con símbolos** | `{"username":"admin;DROP","password":"Password123"}` |

### GET /usuario — LISTAR USUARIOS (sin body)

### GET /usuario/{id} — OBTENER USUARIO (sin body)

### PUT /usuario/{id} — ACTUALIZAR USUARIO

**VÁLIDO ✅**
```json
{
  "username": "jperez2",
  "active": true
}
```

**INVÁLIDOS ❌**

| # | JSON |
|---|------|
| 1 | `{"username":"mucho_mas_de_10_caracteres"}` |
| 2 | `{"password":"123"}` (menos de 8) |
| 3 | `{"active":"no-es-booleano"}` |

### PATCH /usuario/{id} — ACTUALIZAR CONTRASEÑA

**VÁLIDO ✅** (body es texto plano, no JSON)
```
"NuevaPass123"
```

**INVÁLIDO ❌**
```
"123"
```

### PATCH /usuario/{id}/activar-desactivar — ACTIVAR/DESACTIVAR (sin body)

### DELETE /usuario/{id} — ELIMINAR USUARIO (sin body)

---

## 1.3 ROLES (/roles)

### POST /roles — CREAR ROL

**VÁLIDO ✅**
```json
{
  "nombre": "Administrador",
  "descripcion": "Rol con acceso total al sistema"
}
```

**INVÁLIDOS ❌**

| # | JSON |
|---|------|
| 1 | `{"nombre":"A","descripcion":"Muy corto"}` |
| 2 | `{"nombre":"EsteNombreDeRolEsDemasiadoLargoParaSerValidoEnElSistema","descripcion":"Muy largo"}` |
| 3 | `{"nombre":"","descripcion":""}` |

### GET /roles — LISTAR ROLES (sin body)

### GET /roles/{id} — OBTENER ROL (sin body)

### PUT /roles/{id} — ACTUALIZAR ROL

**VÁLIDO ✅**
```json
{
  "nombre": "Super Admin",
  "descripcion": "Rol actualizado",
  "activo": true
}
```

**INVÁLIDO ❌**
```json
{
  "nombre": "",
  "activo": "no-booleano"
}
```

### PATCH /roles/{id} — ACTIVAR/DESACTIVAR ROL (sin body)

### DELETE /roles/{id} — ELIMINAR ROL (sin body)

---

## 1.4 ROLES-USUARIO (/roles-Usuario)

### POST /roles-Usuario — ASIGNAR ROL

**VÁLIDO ✅** (usa UUIDs reales que existan)
```json
{
  "id_user": "550e8400-e29b-41d4-a716-446655440000",
  "id_rol": "550e8400-e29b-41d4-a716-446655440001"
}
```

**INVÁLIDOS ❌**

| # | JSON |
|---|------|
| 1 | `{"id_user":"no-es-uuid","id_rol":"tampoco-es-uuid"}` |
| 2 | `{"id_user":"","id_rol":""}` |

### GET /roles-Usuario — LISTAR ASIGNACIONES (sin body)

### GET /roles-Usuario/asignacion — BUSCAR ASIGNACIÓN
```json
{
  "id_user": "550e8400-e29b-41d4-a716-446655440000",
  "id_rol": "550e8400-e29b-41d4-a716-446655440001"
}
```

### GET /roles-Usuario/roles/{id_rol} — USUARIOS POR ROL (sin body)

### GET /roles-Usuario/usuarios/{id_user} — ROLES POR USUARIO (sin body)

### PUT /roles-Usuario — ACTUALIZAR ASIGNACIÓN
```json
{
  "id_user": "550e8400-e29b-41d4-a716-446655440000",
  "id_rol": "550e8400-e29b-41d4-a716-446655440001",
  "id_nuevo_rol": "550e8400-e29b-41d4-a716-446655440002"
}
```

### PATCH /roles-Usuario/activar-desactivar
```json
{
  "id_user": "550e8400-e29b-41d4-a716-446655440000",
  "id_rol": "550e8400-e29b-41d4-a716-446655440001"
}
```

### DELETE /roles-Usuario
```json
{
  "id_user": "550e8400-e29b-41d4-a716-446655440000",
  "id_rol": "550e8400-e29b-41d4-a716-446655440001"
}
```

---

# ==========================================
# 2. VEHÍCULOS (http://localhost:3000)
# ==========================================

## 2.1 VEHÍCULOS (/vehiculos)

### POST /vehiculos — CREAR AUTO

**VÁLIDO ✅**
```json
{
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
}
```

**INVÁLIDOS ❌**

| # | Qué prueba | JSON |
|---|-----------|------|
| 1 | **Placa formato incorrecto** | `{"tipo":"auto","datos":{"placa":"12345","marca":"Toyota","modelo":"Corolla","color":"Rojo","anio":2022,"clasificacion":"GASOLINA","numeroPuertas":4,"capacidadMaletero":450}}` |
| 2 | **Año < 1885** | `{"tipo":"auto","datos":{"placa":"XYZ-5678","marca":"Ford","modelo":"T","color":"Negro","anio":1800,"clasificacion":"GASOLINA","numeroPuertas":2,"capacidadMaletero":100}}` |
| 3 | **Puertas fuera rango** | `{"tipo":"auto","datos":{"placa":"DEF-9012","marca":"Chevrolet","modelo":"Sail","color":"Azul","anio":2020,"clasificacion":"GASOLINA","numeroPuertas":10,"capacidadMaletero":300}}` |
| 4 | **Marca con números** | `{"tipo":"auto","datos":{"placa":"GHI-3456","marca":"Toyota 2024","modelo":"Corolla","color":"Blanco","anio":2024,"clasificacion":"HIBRIDO","numeroPuertas":4,"capacidadMaletero":400}}` |
| 5 | **Clasificación inválida** | `{"tipo":"auto","datos":{"placa":"JKL-7890","marca":"Honda","modelo":"Civic","color":"Gris","anio":2023,"clasificacion":"NO_EXISTE","numeroPuertas":4,"capacidadMaletero":350}}` |
| 6 | **Maletero negativo** | `{"tipo":"auto","datos":{"placa":"MNO-1234","marca":"Nissan","modelo":"Versa","color":"Plateado","anio":2024,"clasificacion":"GASOLINA","numeroPuertas":4,"capacidadMaletero":-50}}` |

### POST /vehiculos — CREAR MOTOCICLETA

**VÁLIDO ✅**
```json
{
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
}
```

**INVÁLIDO ❌** (placa con formato de auto en lugar de moto)
```json
{
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
}
```

### POST /vehiculos — CREAR CAMIONETA

**VÁLIDO ✅**
```json
{
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
}
```

**INVÁLIDOS ❌**

| # | JSON |
|---|------|
| 1 | `{"tipo":"camioneta","datos":{"placa":"NOP-3456","marca":"Ford","modelo":"Ranger","color":"Azul","anio":2023,"clasificacion":"DIESEL","cabina":"XD","capacidadCarga":-500}}` (cabina < 5 chars, carga negativa) |
| 2 | `{"tipo":"camioneta","datos":{"placa":"QRS-7890","marca":"Mazda","modelo":"BT-50","color":"Rojo","anio":2024,"clasificacion":"DIESEL","cabina":"Cabina sencilla trabajo","capacidadCarga":99999}}` (carga > 10000) |

### POST /vehiculos — INVÁLIDO GENERAL

| # | JSON |
|---|------|
| **Tipo inexistente** | `{"tipo":"triciclo","datos":{}}` |
| **Body vacío** | `{}` |

### GET /vehiculos — LISTAR VEHÍCULOS (sin body)

### GET /vehiculos/{id} — OBTENER VEHÍCULO (sin body)

### PUT /vehiculos/{id} — ACTUALIZAR VEHÍCULO

**VÁLIDO ✅**
```json
{
  "tipo": "auto",
  "datos": {
    "placa": "ABC-1234",
    "marca": "Toyota",
    "modelo": "Corolla XEI",
    "color": "Rojo",
    "anio": 2023,
    "clasificacion": "GASOLINA",
    "numeroPuertas": 4,
    "capacidadMaletero": 500
  }
}
```

**INVÁLIDO ❌**
```json
{
  "tipo": "auto",
  "datos": {
    "placa": "invalida",
    "marca": "",
    "anio": 99,
    "numeroPuertas": 1
  }
}
```

### DELETE /vehiculos/{id} — ELIMINAR VEHÍCULO (sin body)

---

# ==========================================
# 3. ZONAS (http://localhost:8080/api/v1)
# ==========================================

## 3.1 ZONAS (/api/v1/zonas/)

### POST /api/v1/zonas/ — CREAR ZONA

**VÁLIDO ✅**
```json
{
  "nombre": "Zona VIP Central",
  "descripcion": "Zona vip cerca del escenario principal",
  "tipoZona": "VIP",
  "capacidad": 50
}
```

**INVÁLIDOS ❌**

| # | Qué prueba | JSON |
|---|-----------|------|
| 1 | **Nombre < 3 chars** | `{"nombre":"AB","descripcion":"Zona inválida","tipoZona":"REGULAR","capacidad":10}` |
| 2 | **Nombre > 32 chars** | `{"nombre":"ZonaConNombreDemasiadoLargoParaSerValidoEnElSistema","descripcion":"Zona","tipoZona":"REGULAR","capacidad":10}` |
| 3 | **Capacidad 0** | `{"nombre":"Zona Invalida","descripcion":"Capacidad cero","tipoZona":"REGULAR","capacidad":0}` |
| 4 | **Capacidad > 100** | `{"nombre":"Zona Mega","descripcion":"Excede capacidad","tipoZona":"REGULAR","capacidad":999}` |
| 5 | **tipoZona inválido** | `{"nombre":"Zona Prueba","descripcion":"Tipo inválido","tipoZona":"ULTRA_VIP","capacidad":20}` |
| 6 | **Nombre con símbolos** | `{"nombre":"Zona $$$ VIP","descripcion":"Símbolos","tipoZona":"REGULAR","capacidad":10}` |
| 7 | **XSS en descripción** | `{"nombre":"Zona Segura","descripcion":"<script>alert(1)</script>","tipoZona":"REGULAR","capacidad":10}` |
| 8 | **Campos nulos/vacíos** | `{"nombre":"","descripcion":"","tipoZona":"","capacidad":0}` |

### GET /api/v1/zonas/ — LISTAR ZONAS (sin body, opcional ?page=0&size=10)

### PUT /api/v1/zonas/{idZona} — ACTUALIZAR ZONA

**VÁLIDO ✅**
```json
{
  "nombre": "Zona VIP Central Actualizada",
  "descripcion": "Descripción actualizada de la zona",
  "tipoZona": "VIP",
  "capacidad": 60
}
```

**INVÁLIDOS ❌**

| # | JSON |
|---|------|
| 1 | `{"nombre":"XY","tipoZona":"REGULAR","capacidad":10}` (nombre < 3) |
| 2 | `{"nombre":"Zona","tipoZona":"NO_EXISTE","capacidad":10}` |
| 3 | `{"nombre":"Zona","tipoZona":"REGULAR","capacidad":999}` (> 100) |

### PATCH /api/v1/zonas/{idZona}/activar-desactivar?forzar=false — ACTIVAR/DESACTIVAR (sin body, query param)

### PATCH /api/v1/zonas/{idZona}/activar-desactivar?forzar=true — FORZAR DESACTIVACIÓN

### DELETE /api/v1/zonas/{idZona} — ELIMINAR ZONA (sin body)

---

## 3.2 ESPACIOS (/api/v1/espacios/)

### POST /api/v1/espacios/ — CREAR ESPACIO

**VÁLIDO ✅** (usa UUID de una zona que exista)
```json
{
  "idZona": "123e4567-e89b-12d3-a456-426614174000",
  "descripcion": "Espacio A1 cerca de la entrada",
  "tipoEspacio": "AUTO"
}
```

**INVÁLIDOS ❌**

| # | Qué prueba | JSON |
|---|-----------|------|
| 1 | **idZona inválido** | `{"idZona":"no-es-uuid","descripcion":"Espacio","tipoEspacio":"AUTO"}` |
| 2 | **tipoEspacio inválido** | `{"idZona":"123e4567-e89b-12d3-a456-426614174000","descripcion":"Espacio","tipoEspacio":"AVION"}` |
| 3 | **Descripción > 200 chars** | `{"idZona":"123e4567-e89b-12d3-a456-426614174000","descripcion":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","tipoEspacio":"AUTO"}` |
| 4 | **idZona nulo** | `{"idZona":null,"descripcion":"Espacio","tipoEspacio":"AUTO"}` |
| 5 | **Body vacío** | `{}` |

### GET /api/v1/espacios/ — LISTAR ESPACIOS (sin body)

### GET /api/v1/espacios/zona/{idZona} — ESPACIOS POR ZONA (sin body)

### PUT /api/v1/espacios/{id} — ACTUALIZAR ESPACIO

**VÁLIDO ✅**
```json
{
  "idZona": "123e4567-e89b-12d3-a456-426614174000",
  "descripcion": "Espacio actualizado",
  "tipoEspacio": "MOTO"
}
```

### DELETE /api/v1/espacios/{id} — ELIMINAR ESPACIO (sin body)

### PATCH /api/v1/espacios/{id}/estado?estado=OCUPADO — CAMBIAR ESTADO (query param)

Valores válidos: `DISPONIBLE`, `OCUPADO`, `MANTENIMIENTO`

### PATCH /api/v1/espacios/{id}/activar-desactivar — ACTIVAR/DESACTIVAR (sin body)
