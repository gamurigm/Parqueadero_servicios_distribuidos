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
