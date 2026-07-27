# Guía de Despliegue en Minikube (Windows)

Esta guía detalla el proceso completo para limpiar el clúster de Minikube local, volver a crearlo asignando más recursos para evitar fallos de memoria en el Ingress, construir las imágenes Docker internamente e importar los scripts de base de datos (seeds).

---

## prerrequisitos

1. **Terminal de PowerShell ejecutada como Administrador** (necesaria para `minikube delete`, `minikube start` y `minikube tunnel`).
2. Estar ubicado en la raíz del proyecto:
   ```powershell
   cd ".\Parqueadero_servicios_distribuidos"
   ```

---

## Paso 1: Reconfigurar y Recrear Minikube

Para solucionar problemas de inestabilidad y reinicios (`Exit Code: 137`) en el Ingress Controller por falta de memoria/CPU, recrearemos el clúster asignándole recursos óptimos.

1. **Eliminar el clúster actual:**
   ```powershell
   minikube delete
   ```
   *Explicación: Esto borra toda la configuración y volumenes previos para evitar conflictos de recursos.*

2. **Crear el nuevo clúster con 4 CPUs y 8GB de RAM:**
   ```powershell
   minikube start --driver=docker --cpus 4 --memory 8192
   ```
   *Explicación: Indicamos al hipervisor que reserve suficiente CPU y memoria RAM para que todos los microservicios e infraestructura (Postgres, Kong, RabbitMQ, etc.) corran sin ahogarse.*

3. **Habilitar el Ingress Controller de Nginx:**
   ```powershell
   minikube addons enable ingress
   ```
   *Explicación: Activa el balanceador interno Nginx que procesa las reglas definidas en `23-ingress.yml`.*

---

## Paso 2: Configurar Entorno y Construcción de Imágenes Docker

Dado que no estamos usando un registro de imágenes en la nube (como Docker Hub), indicamos a Docker que compile las imágenes directamente en el motor Docker que reside dentro de Minikube.

1. **Enlazar la terminal actual con el demonio de Docker de Minikube:**
   ```powershell
   minikube -p minikube docker-env | Invoke-Expression
   ```
   *Explicación: Cualquier comando `docker build` ejecutado en esta pestaña de terminal guardará la imagen directamente dentro del clúster de Kubernetes.*

2. **Compilar las imágenes de cada componente:**

   * **Frontend (Dashboard):**
     ```powershell
     docker build -t dashboard-espacios:latest -f .\DashboardEspacios\Dockerfile .\DashboardEspacios\
     ```
   * **Microservicio de Usuarios:**
     ```powershell
     docker build -t usuarios:latest -f .\gestion_usuarios\usuarios.dockerfile .\gestion_usuarios\
     ```
   * **Microservicio de Vehículos:**
     ```powershell
     docker build -t vehiculos:latest -f .\vehiculos\vehiculos.dockerfile .\vehiculos\
     ```
   * **Microservicio de Zonas:**
     ```powershell
     docker build -t zonas:latest -f .\zonas\zonas\zonas.dockerfile .\zonas\zonas\
     ```
   * **Microservicio de Tickets:**
     ```powershell
     docker build -t tickets:latest -f .\tickets\tickets.dockerfile .\tickets\
     ```
   * **Microservicio de Trazabilidad:**
     ```powershell
     docker build -t trazabilidad:latest -f .\trazabilidad\trazabilidad.dockerfile .\trazabilidad\
     ```
   * **Microservicio de Auditoría (ms-audit):**
     ```powershell
     docker build -t ms-audit:latest -f .\ms-audit\ms-audit.dockerfile .\ms-audit\
     ```

---

## Paso 3: Desplegar Recursos en Kubernetes

1. **Aplicar los manifiestos YAML:**
   ```powershell
   kubectl apply -f .\minikube\
   ```
   *Explicación: Levanta las bases de datos (StatefulSets), deployments, configmaps, secrets e ingress en el espacio de nombres `app-parqueadero`.*

2. **Esperar que todos los pods estén listos (READY 1/1 o 2/2):**
   ```powershell
   kubectl get pods -n app-parqueadero -w
   ```
   *Nota: Presiona `Ctrl + C` para detener la visualización cuando todos los pods muestren estado `Running`.*

---

## Paso 4: Carga de Datos (Seeds SQL)

Para insertar los datos iniciales, primero copiamos los scripts `.sql` al interior del Pod de base de datos correspondiente y luego ejecutamos el comando `psql` dentro del contenedor.

1. **Usuarios (Base `UsuariosDB` en `usuarios-db-0`):**
   ```powershell
   kubectl cp .\seed\01_usuarios.sql app-parqueadero/usuarios-db-0:/tmp/01_usuarios.sql
   kubectl exec -it usuarios-db-0 -n app-parqueadero -- psql -U admin_user -d UsuariosDB -f /tmp/01_usuarios.sql
   ```

2. **Vehículos (Base `VehiculoDB` en `vehiculos-db-0`):**
   ```powershell
   kubectl cp .\seed\02_vehiculos.sql app-parqueadero/vehiculos-db-0:/tmp/02_vehiculos.sql
   kubectl exec -it vehiculos-db-0 -n app-parqueadero -- psql -U admin_user -d VehiculoDB -f /tmp/02_vehiculos.sql
   ```

3. **Asignaciones de Trazabilidad (Base `TrazabilidadDB` en `trazabilidad-db-0`):**
   ```powershell
   kubectl cp .\seed\03_asignaciones.sql app-parqueadero/trazabilidad-db-0:/tmp/03_asignaciones.sql
   kubectl exec -it trazabilidad-db-0 -n app-parqueadero -- psql -U admin_user -d TrazabilidadDB -f /tmp/03_asignaciones.sql
   ```

4. **Zonas y Espacios (Base `ZonasDB` en `zonas-db-0`):**
   ```powershell
   kubectl cp .\seed\04_zonas_espacios.sql app-parqueadero/zonas-db-0:/tmp/04_zonas_espacios.sql
   kubectl exec -it zonas-db-0 -n app-parqueadero -- psql -U admin_user -d ZonasDB -f /tmp/04_zonas_espacios.sql
   ```

5. **Tickets (Base `TicketsDB` en `tickets-db-0`):**
   ```powershell
   kubectl cp .\seed\05_tickets.sql app-parqueadero/tickets-db-0:/tmp/05_tickets.sql
   kubectl exec -it tickets-db-0 -n app-parqueadero -- psql -U admin_user -d TicketsDB -f /tmp/05_tickets.sql
   ```

---

## Paso 5: Levantamiento de Puertos y Túneles (En terminales separadas)

1. **Abrir el Túnel de Ingress (Terminal de Administrador independiente):**
   ```powershell
   minikube tunnel
   ```
   *Explicación: Esto enruta el tráfico de red de tu host local (Windows) hacia los balanceadores e ingress dentro del clúster.*

2. **Redireccionar el Puerto de Kong Gateway (Otra terminal independiente):**
   ```powershell
   kubectl port-forward -n app-parqueadero service/kong-proxy 8000:8000
   ```
   *Explicación: Permite al frontend que se ejecuta en tu navegador enviar las peticiones de autenticación y lógica a `http://localhost:8000`.*
