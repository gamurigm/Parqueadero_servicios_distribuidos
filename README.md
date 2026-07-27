# Parqueadero - Sistema de Gestion de Estacionamiento

Sistema distribuido para la gestion de un parqueadero, implementado con microservicios, API Gateway y una interfaz unificada de documentacion.

---

## Arquitectura

```
                    ┌──────────────────────────────────────────────────┐
                    │                 Kong Gateway                     │
                    │              localhost:8000                      │
                    └──────┬──────────────┬──────────────┬────────────┘
                           │              │              │
              ┌────────────┘    ┌─────────┘    ┌────────┘
              ▼                 ▼               ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │   Vehiculos  │  │   Usuarios   │  │    Zonas     │
     │   NestJS     │  │   NestJS     │  │  Spring Boot │
     │  :3000       │  │  :5000       │  │  :8080       │
     └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
            │                 │                  │
            └────────┬────────┘──────────────────┘
                     ▼
            ┌──────────────────┐
            │   PostgreSQL     │
            │  UsuariosDB      │
            │  :5436           │
            └──────────────────┘
```

## Servicios

| Servicio | Framework | Puerto | Descripcion |
|----------|-----------|--------|-------------|
| Vehiculos | NestJS | `3000` | CRUD de vehiculos, registro de entrada/salida |
| Usuarios | NestJS | `5000` | Gestion de usuarios, roles y personas |
| Zonas | Spring Boot | `8080` | Administracion de zonas del parqueadero |

## Infraestructura

| Componente | Proposito | Puerto |
|------------|-----------|--------|
| **Kong** | API Gateway | `8000` (Proxy) / `9001` (Admin) |
| **Konga** | UI administrativa para Kong | `1337` |
| **Swagger UI** | Documentacion unificada de APIs | `8085` |
| **PostgreSQL** | Base de datos compartida | `5436` |
| **Kong-DB** | Base de datos de Kong | `5432` |

---

## Requisitos

- Docker y Docker Compose
- Git

## Inicio Rapido

### 1. Clonar el repositorio

```bash
git clone https://github.com/gamurigm/Parqueadero_servicios_distribuidos.git
cd Parqueadero_servicios_distribuidos
```

### 2. Construir y levantar

```bash
docker compose -f docker-kong-compose.yml build
docker compose -f docker-kong-compose.yml up -d
```

### 3. Verificar el estado

```bash
docker compose -f docker-kong-compose.yml ps
```

### 4. Acceder a los servicios

| Servicio | URL |
|----------|-----|
| Kong Gateway | http://localhost:8000 |
| Kong Admin API | http://localhost:9001 |
| Konga (Admin UI) | http://localhost:1337 |
| Swagger UI | http://localhost:8085 |
| Vehiculos API | http://localhost:3000 |
| Usuarios API | http://localhost:5000 |
| Zonas API | http://localhost:8080 |

## Documentacion de APIs

Cada microservicio expone su propia documentacion Swagger:

- **Vehiculos:** `http://localhost:3000/api`
- **Usuarios:** `http://localhost:5000/docs`
- **Zonas:** `http://localhost:8080/swagger-ui.html`

La interfaz unificada en `http://localhost:8085` las agrupa todas.

## Rutas en Kong Gateway

Despues de configurar Kong, las rutas quedan disponibles en:

| Servicio | Ruta en Kong |
|----------|-------------|
| Vehiculos | `http://localhost:8000/vehiculos` |
| Usuarios | `http://localhost:8000/usuarios` |
| Zonas | `http://localhost:8000/zonas` |

## Comandos Utiles

```bash
# Ver logs de todos los servicios
docker compose -f docker-kong-compose.yml logs -f

# Ver logs de un servicio especifico
docker compose -f docker-kong-compose.yml logs -f vehiculos

# Detener servicios
docker compose -f docker-kong-compose.yml down

# Detener y eliminar volumenes
docker compose -f docker-kong-compose.yml down -v

# Reconstruir un servicio especifico
docker compose -f docker-kong-compose.yml build vehiculos
```

## Desarrollo Local

Cada microservicio se puede ejecutar independientemente sin Docker:

```bash
cd vehiculos
pnpm install
pnpm run start:dev
```

> **Nota:** En desarrollo local apuntan a `localhost:5436` (PostgreSQL) en lugar del contenedor.

---

## Estructura del Proyecto

```
practica_clase/
├── docker-kong-compose.yml     # Orquestacion completa con Kong
├── docker-compose.yml          # Solo bases de datos
├── vehiculos/                  # Microservicio Vehiculos (NestJS)
│   ├── src/
│   │   ├── vehiculos/          # Modulo vehiculos
│   │   └── main.ts
│   └── vehiculos.dockerfile
├── gestion_usuarios/           # Microservicio Usuarios (NestJS)
│   ├── src/
│   │   ├── persona/
│   │   ├── roles/
│   │   ├── roles_usuario/
│   │   ├── usuario/
│   │   └── main.ts
│   └── usuarios.dockerfile
└── zonas/                      # Microservicio Zonas (Spring Boot)
    └── zonas/
        ├── src/
        └── zonas.dockerfile
```

---

## Anexo: Despliegue Replicable

El proyecto esta preparado para levantarse completo con Docker Compose: bases de datos, microservicios, OPA, RabbitMQ, Kong, Swagger UI, frontend y carga inicial de datos.

### Requisitos del entorno

- Git.
- Docker Desktop o Docker Engine con Docker Compose v2.
- Puertos libres en la maquina host:
  - `8000`, `9001`, `8443`, `8444` para Kong.
  - `5500` para el frontend.
  - `8085` para Swagger UI.
  - `1337` para Konga.
  - `3001`, `5000`, `8081`, `3002`, `3003`, `3004` para acceso directo a microservicios.
  - `5436`, `5437`, `5438`, `5439`, `5440`, `5441`, `5450`, `5672`, `15672`, `8181` para infraestructura.

Si alguno de esos puertos esta ocupado, detenga el servicio que lo usa o cambie el mapeo de puertos en `docker-kong-compose.yml`.

### Pasos de despliegue desde cero

```bash
git clone https://github.com/gamurigm/Parqueadero_servicios_distribuidos.git
cd Parqueadero_servicios_distribuidos

# Construir todas las imagenes
docker compose -f docker-kong-compose.yml build

# Levantar toda la plataforma
docker compose -f docker-kong-compose.yml up -d

# Revisar estado de servicios
docker compose -f docker-kong-compose.yml ps

# Revisar la carga inicial de datos
docker compose -f docker-kong-compose.yml logs db-seed
```

El servicio `init-keys` genera las llaves JWT compartidas y el servicio `db-seed` carga datos de demostracion despues de que los microservicios creen sus tablas. Para reiniciar desde cero, incluyendo bases limpias:

```bash
docker compose -f docker-kong-compose.yml down -v
docker compose -f docker-kong-compose.yml up -d --build
```

### URLs de uso

| Componente | URL |
|------------|-----|
| Frontend | http://localhost:5500 |
| Kong Gateway | http://localhost:8000 |
| Swagger UI unificado | http://localhost:8085 |
| Konga | http://localhost:1337 |
| OPA | http://localhost:8181 |
| RabbitMQ Management | http://localhost:15672 |

### Rutas principales via Kong

| Modulo | Ruta |
|--------|------|
| Usuarios/Auth/Roles | `http://localhost:8000/usuarios` |
| Vehiculos | `http://localhost:8000/vehiculos` |
| Zonas/Espacios | `http://localhost:8000/zonas` |
| Trazabilidad/Asignaciones | `http://localhost:8000/trazabilidad` |
| Tickets | `http://localhost:8000/tickets` |
| Auditoria | `http://localhost:8000/audit` |

### Usuarios de prueba incluidos

| Usuario | Contrasena | Rol |
|---------|------------|-----|
| `testadmin` | `Admin123!` | `admin` |
| `admin1` | `Admin123!` | `admin` |
| `superusr` | `Super123!` | `super_user` |
| `super1` | `Super123!` | `super_user` |
| `jpropiet` | `Prop123!` | `propietario` |
| `mgomez` | `Prop123!` | `propietario` |
| `emple1` | `Zona123!` | `empleado` |
| `ezona1` | `Zona123!` | `encargado_zona` |
| `auditor1` | `Audit123!` | `auditor` |

El registro publico desde la UI crea usuarios con rol `propietario`. La asignacion de otros roles debe hacerse desde la administracion por un usuario con permisos.

### Verificacion rapida por consola

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/usuarios/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","password":"Admin123!"}' \
  | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')

curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/usuarios/usuario
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/usuarios/roles
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/vehiculos/vehiculos
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/zonas/api/v1/zonas/
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/tickets
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/trazabilidad/asignaciones
```

En PowerShell se puede usar `curl.exe` para evitar el alias de `Invoke-WebRequest`.

---

## Anexo: Guia de Despliegue en Minikube (Windows)

Esta guia tambien queda disponible como archivo independiente en `guia_despliegue_minikube.md`.

Esta guia detalla el proceso completo para limpiar el cluster de Minikube local, volver a crearlo asignando mas recursos para evitar fallos de memoria en el Ingress, construir las imagenes Docker internamente e importar los scripts de base de datos (seeds).

### Prerrequisitos

1. Terminal de PowerShell ejecutada como Administrador, necesaria para `minikube delete`, `minikube start` y `minikube tunnel`.
2. Estar ubicado en la raiz del proyecto:

```powershell
cd ".\Parqueadero_servicios_distribuidos"
```

### Paso 1: Reconfigurar y recrear Minikube

Para solucionar problemas de inestabilidad y reinicios (`Exit Code: 137`) en el Ingress Controller por falta de memoria/CPU, recree el cluster asignandole recursos suficientes.

```powershell
minikube delete
minikube start --driver=docker --cpus 4 --memory 8192
minikube addons enable ingress
```

### Paso 2: Configurar entorno y construir imagenes Docker

Como no se usa un registro de imagenes externo, los builds deben quedar dentro del Docker daemon de Minikube.

```powershell
minikube -p minikube docker-env | Invoke-Expression

docker build -t dashboard-espacios:latest -f .\DashboardEspacios\Dockerfile .\DashboardEspacios\
docker build -t usuarios:latest -f .\gestion_usuarios\usuarios.dockerfile .\gestion_usuarios\
docker build -t vehiculos:latest -f .\vehiculos\vehiculos.dockerfile .\vehiculos\
docker build -t zonas:latest -f .\zonas\zonas\zonas.dockerfile .\zonas\zonas\
docker build -t tickets:latest -f .\tickets\tickets.dockerfile .\tickets\
docker build -t trazabilidad:latest -f .\trazabilidad\trazabilidad.dockerfile .\trazabilidad\
docker build -t ms-audit:latest -f .\ms-audit\ms-audit.dockerfile .\ms-audit\
```

### Paso 3: Desplegar recursos en Kubernetes

Los manifiestos estan en `minikube/` y crean el namespace `app-parqueadero`, secretos, configmaps, volumenes, bases de datos, RabbitMQ, OPA, Kong, Swagger UI, Konga, microservicios, frontend e Ingress.

```powershell
kubectl apply -f .\minikube\
kubectl get pods -n app-parqueadero -w
```

Cuando todos los pods muestren estado `Running` y contenedores listos (`1/1` o `2/2`), detenga la visualizacion con `Ctrl + C`.

### Paso 4: Cargar datos iniciales

Copie cada script SQL al pod de base de datos correspondiente y ejecutelo con `psql`.

```powershell
kubectl cp .\seed\01_usuarios.sql app-parqueadero/usuarios-db-0:/tmp/01_usuarios.sql
kubectl exec -it usuarios-db-0 -n app-parqueadero -- psql -U admin_user -d UsuariosDB -f /tmp/01_usuarios.sql

kubectl cp .\seed\02_vehiculos.sql app-parqueadero/vehiculos-db-0:/tmp/02_vehiculos.sql
kubectl exec -it vehiculos-db-0 -n app-parqueadero -- psql -U admin_user -d VehiculoDB -f /tmp/02_vehiculos.sql

kubectl cp .\seed\03_asignaciones.sql app-parqueadero/trazabilidad-db-0:/tmp/03_asignaciones.sql
kubectl exec -it trazabilidad-db-0 -n app-parqueadero -- psql -U admin_user -d TrazabilidadDB -f /tmp/03_asignaciones.sql

kubectl cp .\seed\04_zonas_espacios.sql app-parqueadero/zonas-db-0:/tmp/04_zonas_espacios.sql
kubectl exec -it zonas-db-0 -n app-parqueadero -- psql -U admin_user -d ZonasDB -f /tmp/04_zonas_espacios.sql

kubectl cp .\seed\05_tickets.sql app-parqueadero/tickets-db-0:/tmp/05_tickets.sql
kubectl exec -it tickets-db-0 -n app-parqueadero -- psql -U admin_user -d TicketsDB -f /tmp/05_tickets.sql
```

### Paso 5: Levantar puertos y tuneles

Abra el tunel de Ingress en una terminal de PowerShell como Administrador:

```powershell
minikube tunnel
```

En otra terminal, redireccione el puerto de Kong Gateway:

```powershell
kubectl port-forward -n app-parqueadero service/kong-proxy 8000:8000
```

El Ingress usa el host `parqueadero.local` y las rutas principales pasan por Kong:

| Componente | Ruta |
|------------|------|
| Frontend | `http://parqueadero.local/` |
| Usuarios/Auth/Roles | `http://parqueadero.local/usuarios` |
| Vehiculos | `http://parqueadero.local/vehiculos` |
| Zonas/Espacios | `http://parqueadero.local/zonas` |
| Trazabilidad/Asignaciones | `http://parqueadero.local/trazabilidad` |
| Tickets | `http://parqueadero.local/tickets` |
| Auditoria | `http://parqueadero.local/audit` |
| Swagger UI | `http://parqueadero.local/swagger` |
| Konga | `http://parqueadero.local/konga` |

Si `parqueadero.local` no resuelve, agregue el host con la IP de Minikube obtenida mediante `minikube ip` en el archivo `hosts` de Windows.

---

## Anexo: Informe de Pruebas Realizadas

### Objetivo

Validar que la aplicacion sea funcional y replicable despues de levantar el stack completo: autenticacion, roles, carga de datos inicial, frontend, servicios por Kong y registro publico de usuarios.

### Ambiente de pruebas

- Rama: `main`.
- Orquestacion: `docker-kong-compose.yml`.
- Fecha de prueba: 2026-07-27.
- Gateway de la verificacion local: `http://localhost:8020` por conflicto con otro Kong local. En un despliegue limpio el puerto por defecto es `http://localhost:8000`.
- Frontend de la verificacion local: `http://localhost:5522`. En un despliegue limpio el puerto por defecto es `http://localhost:5500`.

### Pruebas de construccion

| Prueba | Comando | Resultado |
|--------|---------|-----------|
| Build frontend Vue | `cd DashboardEspacios && npm run build` | Exitoso |
| Tests frontend | `cd DashboardEspacios && npm test` | Exitoso, `13/13` pruebas |
| Build usuarios | `cd gestion_usuarios && npm run build` | Exitoso |
| Validacion Compose | `docker compose -f docker-kong-compose.yml config --quiet` | Exitoso |
| Sintaxis seed | `sh -n seed/run-seeds.sh` | Exitoso |
| Validacion UUIDs seed | script Node sobre `seed/*.sql` | Exitoso, `90` UUIDs validos v4/RFC4122 |

### Pruebas de carga inicial de datos

Se valido que `db-seed` espere la creacion de tablas por los microservicios antes de insertar datos. Conteos obtenidos por API despues de login con `testadmin/Admin123!`:

| Recurso | Resultado |
|---------|-----------|
| Usuarios | `9` registros |
| Roles | `6` registros |
| Roles asignados | `9` registros |
| Vehiculos | `3` registros |
| Zonas | `4` registros en ambiente probado |
| Espacios | `27` registros en ambiente probado |
| Tickets | `5` registros |
| Asignaciones vehiculo/propietario | `3` registros |

### Pruebas funcionales por API

| Flujo | Resultado |
|-------|-----------|
| Login `testadmin/Admin123!` | `200 OK`, token JWT emitido con rol `admin` |
| Listado de usuarios, roles y roles-Usuario | `200 OK` |
| Listado de vehiculos | `200 OK` |
| Listado de zonas y espacios | `200 OK` |
| Listado de tickets | `200 OK` |
| Listado de asignaciones | `200 OK` |
| Registro publico sin `rolId` | `201 Created` |
| Login del usuario registrado | `200 OK`, rol `propietario` |
| Consulta de roles del usuario registrado | `200 OK`, asignacion `propietario` activa |

### Pruebas funcionales de frontend

- El frontend permite iniciar sesion con usuarios existentes.
- El menu y las rutas se filtran por los roles reales del usuario autenticado.
- El rol activo se actualiza al hacer login para evitar permisos visuales heredados de sesiones anteriores.
- El registro publico no permite escoger rol; crea un usuario normal con rol `propietario`.
- Los usuarios con roles administrativos pueden seguir gestionando usuarios y roles desde las pantallas autorizadas.

### Observaciones

- Si se vuelve a ejecutar el seed, los tokens existentes pueden invalidarse por limpieza de `active_tokens`; en ese caso se debe cerrar sesion y volver a iniciar sesion.
- Para pruebas en maquinas con otros proyectos Docker corriendo, pueden aparecer conflictos de puertos. El despliegue replicable limpio usa los puertos documentados arriba.
- Las credenciales y secretos incluidos son de ambiente academico/demostracion; para produccion se deben reemplazar passwords, `JWT_SECRET` y configuraciones sensibles.
