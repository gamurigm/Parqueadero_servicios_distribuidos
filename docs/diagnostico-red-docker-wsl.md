# Diagnóstico: Problema de Red Docker en WSL2

## 1. Problema

Tras un reinicio limpio con `docker compose down && docker compose -f docker-kong-compose.yml up -d`, el microservicio **usuarios** no podía conectarse a su base de datos (usuarios-database:5432), quedando en un bucle de reintentos.

**Síntoma inicial:**
```
ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)...
Error: connect ETIMEDOUT 172.26.0.10:5432
```

---

## 2. Diagnóstico Paso a Paso

### 2.1 Verificar estado de los contenedores

**Comando:**
```bash
docker compose -f docker-kong-compose.yml ps
```

**Resultado:**
```
NAME                    IMAGE                          STATUS                   PORTS
audit-database          postgres:16-alpine             Up 4 minutes (healthy)   0.0.0.0:5450->5432/tcp
dashboard-roles         dashboard-roles:latest         Up 3 minutes             0.0.0.0:5500->80/tcp
kong-database           postgres:16-alpine             Up 4 minutes (healthy)   0.0.0.0:5432->5432/tcp
kong-gateway            kong:latest                    Up 3 minutes (healthy)   0.0.0.0:8000->8000/tcp
konga                   pantsel/konga:latest           Up 4 minutes             0.0.0.0:1337->1337/tcp
ms-audit                ms-audit:latest                Up 3 minutes             0.0.0.0:3004->3006/tcp
opa                     openpolicyagent/opa:latest     Up 4 minutes             0.0.0.0:8181->8181/tcp
rabbitmq-audit          rabbitmq:3-management          Up 4 minutes (healthy)   0.0.0.0:5672->5672/tcp
swagger-ui              swaggerapi/swagger-ui:latest   Up 4 minutes             0.0.0.0:8085->8080/tcp
tickets                 tickets:latest                 Up 3 minutes             0.0.0.0:3003->3003/tcp
tickets-database        postgres:16-alpine             Up 4 minutes (healthy)   0.0.0.0:5441->5432/tcp
trazabilidad            trazabilidad:latest            Up 3 minutes             0.0.0.0:3002->3002/tcp
trazabilidad-database   postgres:16-alpine             Up 4 minutes (healthy)   0.0.0.0:5440->5432/tcp
usuarios                usuarios:latest                Up About a minute        0.0.0.0:5000->5000/tcp
usuarios-database       postgres:16-alpine             Up 4 minutes (healthy)   0.0.0.0:5436->5432/tcp
vehiculos               vehiculos:latest               Up 3 minutes             0.0.0.0:3001->3000/tcp
vehiculos-database      postgres:16-alpine             Up 4 minutes (healthy)   0.0.0.0:5437->5432/tcp
zonas                   zonas:latest                   Up 3 minutes             0.0.0.0:8081->8080/tcp
zonas-database          postgres:16-alpine             Up 4 minutes (healthy)   0.0.0.0:5438->5432/tcp
```

Todos los contenedores están **Up**, pero usuarios se levantó "About a minute" después que los demás.

---

### 2.2 Revisar logs del servicio usuarios

**Comando:**
```bash
docker logs usuarios --tail 50
```

**Resultado:**
```
[Nest] 1  - 07/22/2026, 12:46:08     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 07/22/2026, 12:46:08     LOG [InstanceLoader] TypeOrmModule dependencies initialized +77ms
[Nest] 1  - 07/22/2026, 12:46:08     LOG [InstanceLoader] PassportModule dependencies initialized +1ms
...
[Nest] 1  - 07/22/2026, 12:48:14     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 07/22/2026, 12:48:14     LOG [InstanceLoader] TypeOrmModule dependencies initialized +31ms
...
[Nest] 1  - 07/22/2026, 12:50:27   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)...
Error: connect ETIMEDOUT 172.26.0.10:5432
```

**Captura:**
<!-- Espacio para captura de pantalla de los logs -->

El servicio se reinició dos veces y luego empezó a fallar conectando a `172.26.0.10:5432`.

---

### 2.3 Verificar variables de entorno del contenedor usuarios

**Comando:**
```bash
docker inspect usuarios --format='{{range .Config.Env}}{{println .}}{{end}}' | grep -E "DB_|HOST"
```

**Resultado:**
```
DB_USER=admin_user
DB_NAME=UsuariosDB
DB_HOST=usuarios-database
DB_PASSWORD=xasmdno123XAW2342as
DB_PORT=5432
```

Las variables de entorno están correctas: apuntan al hostname `usuarios-database` y puerto `5432`.

---

### 2.4 Verificar redes Docker disponibles

**Comando:**
```bash
docker network ls
```

**Resultado:**
```
NETWORK ID     NAME                              DRIVER    SCOPE
b5ad90b3154d   practica_clase_kong-net           bridge    local
```

La red se llama `practica_clase_kong-net` (Docker Compose antepone el nombre del directorio `practica_clase`).

---

### 2.5 Verificar IP de los contenedores en la red

**Comando:**
```bash
docker inspect usuarios-database --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
docker inspect usuarios --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
```

**Resultado:**
| Contenedor | IP |
|---|---|
| usuarios-database | 172.26.0.10 |
| usuarios | 172.26.0.16 |
| kong-gateway | 172.26.0.4 |

Ambos están en la misma subred `172.26.0.0/16` y en la misma red (`b5ad90b3154d...`).

---

### 2.6 Prueba de conectividad: ping desde contenedor temporal

**Comando:**
```bash
docker run --rm --network practica_clase_kong-net alpine sh -c "ping -c 3 usuarios-database"
```

**Resultado:**
```
PING usuarios-database (172.26.0.10): 56 data bytes
--- usuarios-database ping statistics ---
3 packets transmitted, 0 packets received, 100% packet loss
```

**Captura:**
<!-- Espacio para captura de pantalla del ping fallido -->

La resolución DNS funciona (`usuarios-database` → `172.26.0.10`) pero el tráfico ICMP se pierde **completamente**.

---

### 2.7 Prueba de conectividad: ping a kong-gateway (control)

**Comando:**
```bash
docker run --rm --network practica_clase_kong-net alpine sh -c "ping -c 3 kong-gateway"
```

**Resultado:**
```
PING kong-gateway (172.26.0.4): 56 data bytes
64 bytes from 172.26.0.4: seq=0 ttl=64 time=0.515 ms
64 bytes from 172.26.0.4: seq=1 ttl=64 time=0.127 ms
64 bytes from 172.26.0.4: seq=2 ttl=64 time=0.128 ms
--- kong-gateway ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
```

✅ **kong-gateway SÍ es accesible.** El problema no es general de la red, sino específico de ciertos contenedores.

---

### 2.8 Prueba de conectividad: ping a usuarios (container de NestJS)

**Comando:**
```bash
docker run --rm --network practica_clase_kong-net alpine sh -c "ping -c 3 usuarios"
```

**Resultado:**
```
PING usuarios (172.26.0.16): 56 data bytes
--- usuarios ping statistics ---
3 packets transmitted, 0 packets received, 100% packet loss
```

❌ Tampoco se puede alcanzar el servicio `usuarios`. No es solo la base de datos.

---

### 2.9 Prueba de conectividad: TCP al puerto 5432 de la DB

**Comando:**
```bash
docker run --rm --network practica_clase_kong-net alpine sh -c "nc -zv -w5 usuarios-database 5432"
```

**Resultado:**
```
nc: usuarios-database (172.26.0.10:5432): Operation timed out
```

**Captura:**
<!-- Espacio para captura de pantalla del nc timeout -->

No es solo ICMP: **TCP también** falla.

---

### 2.10 Prueba de conectividad: TCP al puerto 8000 de kong (control)

**Comando:**
```bash
docker run --rm --network practica_clase_kong-net alpine sh -c "nc -zv -w5 kong-gateway 8000"
```

**Resultado:**
```
kong-gateway (172.26.0.4:8000) open
```

✅ Confirmado: Kong es accesible, los contenedores con Postgres y NestJS no.

---

### 2.11 Verificar que Postgres escucha en todas las interfaces

**Comando:**
```bash
docker exec usuarios-database sh -c "netstat -tlnp"
```

**Resultado:**
```
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN
tcp        0      0 :::5432                 :::*                    LISTEN
```

PostgreSQL escucha en `0.0.0.0:5432` (todas las interfaces). ✅

**Comando (config check):**
```bash
docker exec usuarios-database grep listen_addresses /var/lib/postgresql/data/postgresql.conf
```

**Resultado:**
```
listen_addresses = '*'
```

✅ Configurado correctamente.

---

### 2.12 Prueba desde dentro del mismo contenedor DB

**Comando:**
```bash
docker exec usuarios-database sh -c "PGPASSWORD=xasmdno123XAW2342as psql -h 172.26.0.10 -U admin_user -d UsuariosDB -c 'SELECT 1;'"
```

**Resultado:**
```
 ?column?
----------
        1
(1 row)
```

✅ Desde dentro del contenedor funciona. El problema es exclusivamente de **red entre contenedores**.

---

### 2.13 Resolución DNS desde la red

**Comando:**
```bash
docker run --rm --network practica_clase_kong-net alpine sh -c "apk add --no-cache bind-tools >/dev/null 2>&1; host usuarios-database; host kong-gateway"
```

**Resultado:**
```
usuarios-database has address 172.26.0.10
kong-gateway has address 172.26.0.4
```

La resolución DNS funciona bien para ambos. El problema no es DNS.

---

## 3. Conclusión del Diagnóstico

| Prueba | Resultado |
|---|---|
| DNS resolution | ✅ Funciona |
| Ping a kong-gateway | ✅ 0% pérdida |
| Ping a usuarios-database | ❌ 100% pérdida |
| Ping a usuarios | ❌ 100% pérdida |
| TCP a kong-gateway:8000 | ✅ Abierto |
| TCP a usuarios-database:5432 | ❌ Timeout |
| DB desde sí misma (localhost) | ✅ Funciona |
| DB desde sí misma (172.26.0.10) | ✅ Funciona |
| Variables de entorno DB_HOST | ✅ Correctas |
| Config Postgres listen_addresses | ✅ `'*'` |
| Misma red Docker | ✅ Misma subred 172.26.0.0/16 |

**El problema es a nivel de Docker bridge network en WSL2:** los contenedores `usuarios-database` y `usuarios` (y posiblemente otros basados en Alpine/postgres) no son accesibles desde otros contenedores en la misma red bridge, mientras que `kong-gateway` (basado en Kong, que corre sobre Ubuntu base) sí funciona.

**Causa probable:** El driver de red bridge de Docker en WSL2 tiene una corrupción o bug que impide el tráfico hacia ciertos contenedores. Específicamente contenedores basados en imágenes Alpine/postgres-alpine.

---

## 4. Soluciones Posibles

### Solución 1: Restaurar red y contenedores desde cero
```bash
# Bajar todo
docker compose -f docker-kong-compose.yml down -v

# Limpiar redes huérfanas
docker network prune -f

# Reconstruir imágenes (forzar rebuild)
docker compose -f docker-kong-compose.yml build --no-cache

# Re-crear todo
docker compose -f docker-kong-compose.yml up -d
```
*Nota: `-v` elimina volúmenes, perderás datos de DB.*

### Solución 2: Reiniciar Docker Desktop
```bash
# En PowerShell (no en WSL)
& 'C:\Program Files\Docker\Docker\Docker Desktop.exe' --restart
```
Esto reinicia el motor Docker y las redes virtuales desde cero.

### Solución 3: Usar network_mode: host (workaround)
Modificar el `docker-compose.yml` para que usuarios use `network_mode: "host"` temporalmente.

---

## 5. Verificación Post-Solución

Una vez aplicada alguna solución, verificar:

```bash
# Probar login a través de Kong
curl -s -X POST http://localhost:8000/usuarios/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"Admin123!"}'
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "hex...",
  "user": {
    "id": "uuid",
    "username": "admin1",
    "roles": ["super_user", "admin"]
  }
}
```

**Captura:**
<!-- Espacio para captura de pantalla del login exitoso -->

---

## 6. Acceso al Frontend

Una vez la red funcione, el frontend está disponible en:

- **Producción (Docker):** http://localhost:5500
- **Desarrollo (Vite hot-reload):** http://localhost:5500 (desde `cd DashboardEspacios && npm run dev`)

