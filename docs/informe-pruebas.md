# Informe de pruebas y hallazgos

Fecha de ejecucion: 2026-07-27
Rama evaluada: `main`
Base de revision: `Rubrica de evaluacion - Proyecto Final.docx`

## Resumen ejecutivo

El proyecto cubre una parte importante de la rubrica: existen los microservicios principales, Dockerfiles, frontend, RabbitMQ, Kong, manifiestos Minikube y documentacion de despliegue. Sin embargo, no cumple al 100% con todos los casos de prueba de la rubrica.

Los bloqueos principales son:

- El Ingress de Minikube usa `parqueadero.local`, pero la rubrica exige `parkin.espe.edu.ec`.
- SSE esta implementado dentro de `tickets`, no como microservicio `ms-sse` separado ni con propagacion comprobable desde RabbitMQ.
- Los rechazos de emision de ticket no publican evento de auditoria; esto afecta CP-02, CP-03 y CP-04.
- El cierre/pago usa estado `PAGADO`; la rubrica pide estado `RECAUDADO` para CP-06.
- La tarifa por defecto no garantiza el caso exacto de `$2.00` por 2 horas a `$1/h`.
- Hay suites de prueba incompletas o mal configuradas en algunos microservicios.

## Pruebas ejecutadas

| Modulo | Comando | Resultado | Hallazgo |
|--------|---------|-----------|----------|
| Frontend `DashboardEspacios` | `npm test` | Exitoso | 5 archivos, 13 pruebas pasadas. |
| Tickets | `npm test` | Exitoso | 1 suite, 5 pruebas pasadas sobre entidad de dominio `Ticket`. |
| Auditoria `ms-audit` | `npm test` | Exitoso | 1 suite, 1 prueba pasada. |
| Usuarios `gestion_usuarios` | `npm test` | Fallido | 8 suites fallidas, 1 suite pasada. Faltan providers/mocks de repositorios TypeORM y existe una suite sin tests. |
| Vehiculos | `npm test` | Fallido | 3 suites fallidas. Faltan providers/mocks de `VehiculoRepository` y existe una suite sin tests. |
| Trazabilidad | `npm test` | Fallido | Jest no encontro archivos `*.spec.ts`. |
| Zonas | `.\mvnw.cmd test` | Fallido | Spring intenta levantar contexto con PostgreSQL y no hay base disponible en el entorno local de prueba. |

## Validaciones de build e infraestructura

| Validacion | Comando | Resultado | Hallazgo |
|------------|---------|-----------|----------|
| Build frontend | `npm run build` en `DashboardEspacios` | Exitoso | Vite genero build de produccion correctamente. |
| Build tickets | `npm run build` en `tickets` | Fallido | `node_modules` local no contiene `amqplib` ni `jose`. |
| Build usuarios | `npm run build` en `gestion_usuarios` | Fallido | `node_modules` local no contiene `jose`. |
| Build vehiculos | `npm run build` en `vehiculos` | Fallido | `node_modules` local no contiene `jose`. |
| Build ms-audit | `npm run build` en `ms-audit` | Fallido | `node_modules` local no contiene `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt` ni `jose`. |
| Build trazabilidad | `npm run build` en `trazabilidad` | Fallido | `node_modules` local no contiene `amqplib` ni `jose`. |
| Docker Compose | `docker compose -f docker-kong-compose.yml config --quiet` desde WSL | Exitoso | El archivo Compose es sintacticamente valido. |
| Seeds | `bash -n seed/run-seeds.sh` | Exitoso | El script de carga inicial no presenta errores de sintaxis shell. |
| Kubectl cliente | `kubectl version --client` desde WSL | Exitoso | Cliente disponible: v1.36.2. |
| Manifiestos Minikube | `kubectl apply --dry-run=client --validate=false -f ./minikube/` | No validado | El API server configurado en `https://127.0.0.1:32771` rechazo la conexion. Requiere Minikube activo. |

Nota sobre builds backend: las dependencias faltantes estan declaradas en los `package.json`; el fallo observado corresponde al estado local de `node_modules`. Para repetir una verificacion limpia se debe ejecutar `npm install` o el flujo Docker de cada servicio antes del build.

## Cumplimiento contra rubrica

| Criterio | Estado | Evidencia / hallazgo |
|----------|--------|----------------------|
| Codigo fuente de 7 microservicios | Parcial | Estan usuarios/roles, zonas, audit, vehiculos, trazabilidad, tickets y SSE dentro de tickets. No se encontro un microservicio independiente `ms-sse`. |
| Dockerfile por microservicio | Cumple | Existen Dockerfiles para frontend y servicios backend principales. |
| Frontend con SSE | Cumple parcial | Frontend usa `EventSource` para actualizaciones de espacios. La integracion depende del SSE interno de tickets. |
| RabbitMQ | Cumple parcial | RabbitMQ esta configurado y se usa para auditoria. No se evidencio propagacion RabbitMQ -> `ms-sse` para CP-05. |
| API Gateway | Cumple | Kong y rutas principales estan en Compose y manifiestos Minikube. |
| Kubernetes / Minikube | Cumple parcial | Existen manifiestos en `minikube/`, pero el Ingress usa `parqueadero.local` y no `parkin.espe.edu.ec`. |
| Documentacion y pruebas | Cumple parcial | README incluye guia de despliegue y este informe. Hay pruebas exitosas, pero tambien suites fallidas o ausentes. |

## Casos de prueba integrales de tickets

| Caso | Estado | Observacion |
|------|--------|-------------|
| CP-01 Emision y cierre/pago de ticket | Parcial | La logica valida asignacion, espacio libre, marca ocupado/libre, calcula valor, publica auditoria y emite SSE. Falta prueba integral automatizada end-to-end. |
| CP-02 Rechazo por espacio ocupado | Parcial | La regla existe con `findActivoByEspacio`, pero el rechazo no queda auditado antes de lanzar `BusinessError`. |
| CP-03 Un solo ticket activo por vehiculo | Parcial | La regla existe con `findActivoByPlaca` y restricciones de persistencia, pero el rechazo no queda auditado. |
| CP-04 Vehiculo no asignado al usuario | Parcial | La validacion cedula/placa existe, pero el rechazo no queda auditado. |
| CP-05 SSE multi-cliente via RabbitMQ y `ms-sse` | No cumple completo | Existe SSE interno en `tickets`; no se encontro microservicio `ms-sse` ni puente RabbitMQ hacia SSE. |
| CP-06 Recaudacion, calculo y liberacion automatica | Parcial | El pago calcula horas, cobra y libera el espacio, pero usa estado `PAGADO` y tarifa configurable distinta al escenario exacto `$1/h`. |

## Hallazgos prioritarios

1. Cambiar el host del Ingress Minikube a `parkin.espe.edu.ec` o documentar ambos hosts si se conserva un alias local.
2. Implementar o separar `ms-sse` y consumir eventos desde RabbitMQ para soportar CP-05 de forma estricta.
3. Publicar eventos de auditoria tambien en rutas de rechazo de emision de tickets.
4. Alinear CP-06 con la rubrica: estado `RECAUDADO` o equivalencia documentada, y tarifa de prueba `$1/h`.
5. Corregir suites unitarias de usuarios, vehiculos y zonas agregando mocks/profiles de test para repositorios y base de datos.
6. Agregar pruebas integrales automatizadas para CP-01 a CP-06 con ambiente Docker Compose o Minikube.
