# Plan de Implementación — Microservicio de Emisión de Tickets (NestJS)

## 1. Contexto y alcance

Se implementa un nuevo microservicio **`tickets`**, independiente de los ya existentes (`usuarios`, `vehiculos`, `zonas`, `trazabilidad`), siguiendo el mismo patrón de la arquitectura actual: contenedor propio, base de datos propia, expuesto a través de Kong.

El servicio gestiona el ciclo de vida completo de un ticket de parqueo: emisión, pago y anulación, coordinando información de los microservicios de `usuarios`, `vehiculos` y `zonas` sin acceder directamente a sus bases de datos.

---

## 2. Base de datos dedicada — `TicketsDB`

**Acciones:**

1. Crear un nuevo servicio de base de datos PostgreSQL exclusivo (`tickets-database`) en el `docker-compose.yml`, siguiendo el mismo patrón que `usuarios-database`, `vehiculos-database`, etc.
2. Asignar un puerto libre no usado en el compose actual (por ejemplo `5441:5432`).
3. Definir credenciales propias (`admin_user` / password dedicado) y variable `POSTGRES_DB=TicketsDB`.
4. Agregar `healthcheck` con `pg_isready`, igual que las demás bases.
5. Declarar el volumen `tickets_postgres_data` en la sección `volumes` del compose.
6. El esquema de la tabla `ticket` se gestiona con migraciones (TypeORM o Prisma), **no** con `synchronize` en producción.
7. Definir dos restricciones de integridad a nivel de base de datos (no solo a nivel de aplicación):
   - Un espacio no puede tener más de un ticket en estado `ACTIVO` simultáneamente.
   - Un vehículo (placa) no puede tener más de un ticket en estado `ACTIVO` simultáneamente.
   - Esto se implementa como índices únicos parciales, de forma que la propia base de datos sea la última línea de defensa contra condiciones de carrera, incluso si la validación de aplicación falla por concurrencia.

---

## 3. Arquitectura interna del servicio (SOLID + Segregación de Interfaces)

**Principio general:** el dominio del negocio (reglas de tickets) no debe conocer detalles de HTTP, ORM ni frameworks externos. Se organiza en capas:

- **Dominio**: entidades y reglas de negocio puras (qué es un ticket, qué transiciones de estado son válidas).
- **Aplicación (casos de uso)**: orquestan el flujo — emitir, pagar, anular — usando únicamente contratos (interfaces), nunca implementaciones concretas.
- **Infraestructura**: implementaciones reales (clientes HTTP hacia otros microservicios, repositorio con TypeORM, generador de código de ticket, proveedor de tarifas).
- **Interfaz (controladores + DTOs)**: puerta de entrada HTTP, validación y transformación de datos.

**Segregación de interfaces (ISP):** en lugar de una interfaz genérica "cliente externo", se definen contratos pequeños y específicos por responsabilidad:

- Contrato para consultar usuarios (buscar por cédula, listar vehículos de un usuario).
- Contrato para consultar vehículos (buscar por placa).
- Contrato para consultar y actualizar espacios (buscar por id, marcar ocupado, marcar libre).
- Contrato de repositorio de tickets (crear, buscar, verificar existencia de ticket activo por espacio/vehículo, actualizar).
- Contrato del generador de código de ticket.
- Contrato del proveedor de tarifas.

Cada caso de uso depende solo de los contratos que realmente necesita, no de una interfaz "todo en uno". Esto facilita testing (mocks simples) y cumple el principio de inversión de dependencias: el dominio define el contrato, la infraestructura lo implementa.

**Responsabilidad única (SRP):** cada caso de uso resuelve una sola operación de negocio (emitir, pagar o anular), y cada clase de infraestructura resuelve una sola integración (cliente HTTP de usuarios, cliente HTTP de vehículos, generador de código, etc.).

---

## 4. Comunicación entre microservicios

**Acciones:**

1. El servicio `tickets` **no** se conecta a las bases de datos de `usuarios`, `vehiculos` ni `zonas`. Se comunica por HTTP interno dentro de la red `kong-net`, siguiendo el mismo patrón que ya usa `trazabilidad` con `VEHICULOS_SERVICE_URL` y `USUARIOS_SERVICE_URL`.
2. Definir variables de entorno propias: `USUARIOS_SERVICE_URL=http://usuarios:5000`, `VEHICULOS_SERVICE_URL=http://vehiculos:3000`, `ZONAS_SERVICE_URL=http://zonas:8080`.
3. Cada llamada externa debe manejar explícitamente: timeout, error de conexión, y respuesta 404 (recurso no encontrado) como casos distintos, para dar mensajes claros al cliente final.
4. Documentar en el README del microservicio qué endpoints se esperan de cada servicio externo (contrato de integración), para evitar acoplamiento implícito no documentado.

---

## 5. DTOs — separación Request / Response

Se define explícitamente una carpeta `dto/request` y `dto/response`, para no mezclar el modelo de entrada (lo que el cliente envía y debe validarse) con el modelo de salida (lo que el servicio expone, que puede omitir u ocultar campos internos).

### 5.1 DTOs de Request

- **EmitirTicketRequestDto**: contiene `idEspacio`, opcionalmente `cedula` u opcionalmente `placa` (al menos uno de los dos es obligatorio, se valida con un validador de clase custom), y `idEmpleado` (idealmente derivado del token JWT de sesión, no enviado libremente por el cliente).
- **PagarTicketRequestDto**: contiene `idTicket` o `codigoTicket`, y `idEmpleado` que procesa el pago.
- **AnularTicketRequestDto**: contiene `idTicket` o `codigoTicket`, `idEmpleado`, y un motivo de anulación obligatorio (para trazabilidad).

Reglas de validación transversales a todos los DTO de request:
- Ningún campo de identificación acepta cadenas vacías ni solo espacios en blanco.
- La cédula y la placa se validan contra un patrón de formato explícito.
- Las fechas, cuando existan como entrada, se validan como fechas ISO reales y coherentes (fecha de salida no puede ser anterior a la de ingreso).
- Se aplica sanitización de entrada (trim, rechazo de caracteres no imprimibles) antes de llegar al caso de uso.

### 5.2 DTOs de Response

- **TicketResponseDto**: expone únicamente los campos relevantes para el cliente — código de ticket, espacio, cédula, placa, fecha/hora de ingreso, fecha/hora de salida, estado, valor recaudado (si aplica), nombre del empleado (no su id crudo si no es necesario). No expone campos internos de auditoría técnica.
- **TicketResumenResponseDto**: versión reducida usada en listados (por ejemplo, listar tickets activos), con menos campos que el detalle completo.
- **ErrorResponseDto**: formato uniforme de error (código, mensaje, detalle de validación si aplica), usado por el filtro de excepciones global.

Justificación de la separación: evita que cambios en el modelo de persistencia rompan el contrato expuesto al cliente, y evita filtrar accidentalmente datos sensibles o internos en las respuestas.

---

## 6. Generación del código único de ticket

**Regla de negocio:** el código de ticket es análogo a una cédula — se genera automáticamente, no lo envía el cliente. Formato solicitado: combinación de zona, espacio y timestamp, resultando en 16 dígitos.

**Acciones:**

1. Implementar el generador como una única responsabilidad (un componente que solo genera códigos, sin conocer reglas de negocio de tickets).
2. Definir el formato exacto: dígitos reservados para zona, dígitos reservados para espacio, y dígitos restantes derivados del timestamp actual, hasta completar 16 dígitos.
3. Garantizar unicidad a dos niveles:
   - A nivel de aplicación, generando el código en el momento de la emisión.
   - A nivel de base de datos, con restricción `UNIQUE` sobre el campo del código de ticket.
4. Si ocurre una colisión (caso extremadamente improbable pero posible), el caso de uso debe capturar el error de integridad y reintentar la generación una vez antes de fallar.

---

## 7. Regla de cruce cédula ⇄ placa

**Regla de negocio tal como se especificó:**
- Si el cliente ingresa por **cédula**, el sistema debe resolver la placa asociada.
- Si el cliente ingresa por **placa**, el sistema debe resolver la cédula asociada.
- Si el usuario tiene más de un vehículo registrado, **no se puede resolver automáticamente**: se debe exigir que el cliente envíe la placa explícitamente.

**Flujo de resolución (caso de uso de emisión):**

1. Si llega `placa` en el request: consultar al servicio de vehículos por esa placa; la respuesta debe traer la cédula del propietario. Se usa esa combinación directamente.
2. Si llega `cedula` (sin placa): consultar al servicio de usuarios los vehículos asociados a esa cédula.
   - Si tiene exactamente un vehículo, se toma esa placa automáticamente.
   - Si tiene más de un vehículo, se rechaza la petición indicando que debe reenviarse incluyendo la placa.
   - Si no tiene vehículos asociados, se rechaza la petición: no puede emitirse un ticket sin vehículo.
3. El resultado final es una **clave compuesta resuelta** (cédula, placa), que es la que se persiste en el ticket. Nunca se persiste un ticket con solo uno de los dos datos.

---

## 8. Flujo de emisión de ticket (caso de uso principal)

**Pasos del proceso, en orden:**

1. Validar el DTO de entrada (formato de campos, al menos cédula o placa presente, sin espacios en blanco).
2. Resolver la clave compuesta cédula/placa según la regla de la sección 7.
3. Consultar el servicio de zonas para verificar que el espacio existe y determinar su tipo (para efectos de tarifa).
4. Verificar en el repositorio de tickets que **no exista ya** un ticket en estado `ACTIVO` para ese espacio.
5. Verificar en el repositorio de tickets que **no exista ya** un ticket en estado `ACTIVO` para esa placa (un mismo vehículo no puede tener dos tickets activos en paralelo, incluso en espacios distintos).
6. Si alguna de las verificaciones anteriores falla, rechazar la operación con un mensaje de negocio claro (no un error técnico genérico) indicando cuál es la condición violada.
7. Generar el código único de ticket (sección 6).
8. Registrar el ticket en estado `ACTIVO`, con fecha/hora de ingreso igual al momento de la emisión, id del empleado que lo emite (idealmente tomado de la sesión/JWT), y sin fecha de salida ni valor recaudado aún.
9. Notificar al servicio de zonas que marque el espacio como **Ocupado**.
10. Si el paso 9 falla después de haber creado el ticket, debe existir una estrategia de compensación (reintento o marcado del ticket como pendiente de sincronización), para no dejar el sistema en estado inconsistente.
11. Devolver el `TicketResponseDto` con el código generado.

---

## 9. Flujo de pago de ticket

**Pasos del proceso:**

1. Validar el DTO de entrada (identificador de ticket presente y válido).
2. Buscar el ticket por id o código; si no existe, rechazar con "ticket no encontrado".
3. Verificar que el estado actual del ticket sea `ACTIVO`; si ya está `PAGADO` o `ANULADO`, rechazar la operación indicando el estado actual (no se puede pagar dos veces ni pagar un ticket anulado).
4. Registrar la fecha/hora de salida como el momento actual.
5. Calcular el tiempo transcurrido entre ingreso y salida.
6. Aplicar la regla de cobro por hora o fracción: cualquier fracción de hora iniciada se cobra como hora completa.
7. Obtener la tarifa aplicable cruzando tipo de vehículo y tipo de espacio, consultando la tabla de tarifas configurada (ver sección 10).
8. Calcular el valor recaudado como tarifa por hora multiplicada por el número de horas (o fracciones) cobradas.
9. Actualizar el ticket: estado a `PAGADO`, fecha de salida, valor recaudado, empleado que procesa el pago.
10. Notificar al servicio de zonas que libere el espacio (lo marque como disponible nuevamente).
11. Devolver el `TicketResponseDto` actualizado, incluyendo el valor cobrado.

---

## 10. Tabla de tarifas por variables de entorno

**Acciones:**

1. Definir en el `.env` del microservicio una estructura de tarifas por combinación de tipo de vehículo y tipo de espacio (por ejemplo, tarifa hora para vehículo tipo carro en espacio regular, tarifa hora para moto, tarifa preferencial para espacio reservado, etc.).
2. Implementar un componente único responsable de leer y exponer estas tarifas (proveedor de tarifas), de forma que el caso de uso de pago no conozca el formato de configuración, solo consuma el contrato "dame la tarifa hora para esta combinación".
3. Documentar en el README qué variables de entorno deben configurarse y su formato esperado, para que el equipo de despliegue las gestione sin tocar código.
4. Considerar que el espacio de tipo "reservado" puede tener una tarifa diferenciada; esto debe resolverse en el mismo componente de tarifas, no como una excepción dispersa en el caso de uso.

---

## 11. Flujo de anulación de ticket

**Pasos del proceso:**

1. Validar el DTO de entrada, incluyendo el motivo de anulación (obligatorio para trazabilidad y auditoría).
2. Buscar el ticket por id o código; si no existe, rechazar.
3. Verificar que el estado actual sea `ACTIVO`. Si el ticket ya fue `PAGADO`, la anulación se rechaza explícitamente (regla de negocio: no se puede anular un ticket una vez que ya se pagó / ya pasó su hora de cobro).
4. Actualizar el estado a `ANULADO`, registrando el empleado que anula y el motivo.
5. Notificar al servicio de zonas que libere el espacio, salvo que la regla de negocio defina lo contrario para anulaciones (a validar con negocio si el espacio se libera o no en este caso).
6. El ticket **no se elimina físicamente** en ningún flujo del sistema; solo cambia de estado. Esto es una regla dura del diseño: la tabla `ticket` no expone operación de borrado a nivel de aplicación.

---

## 12. Validaciones de negocio consolidadas

Lista completa de validaciones que debe cubrir el servicio, para dejarlas explícitas como criterios de aceptación:

- No se permite emitir un ticket sin cédula ni placa.
- No se permite emitir un ticket con espacio inexistente.
- No se permite emitir un ticket en un espacio que ya tiene un ticket `ACTIVO`.
- No se permite emitir un ticket para una placa que ya tiene un ticket `ACTIVO` (en cualquier espacio).
- No se permite que un usuario con más de un vehículo emita ticket solo con cédula; debe especificar placa.
- No se permiten placas duplicadas en el sistema de vehículos (esta validación vive en el microservicio de vehículos, pero `tickets` debe manejar con claridad el caso de "vehículo no encontrado" o "dato inconsistente" si llegara a ocurrir).
- No se permite pagar un ticket que no está en estado `ACTIVO`.
- No se permite anular un ticket que ya fue pagado o que ya está anulado.
- No se permite anular un ticket si ya se superó el tiempo de cobro esperado (regla a definir con negocio: por ejemplo, un umbral de tiempo máximo tras el cual solo cabe pago, no anulación).
- Todos los identificadores de entrada (cédula, placa, id de espacio, id de empleado) se sanitizan: sin espacios en blanco al inicio/fin, sin cadenas vacías, formato validado.
- Todas las fechas manejadas por el sistema deben ser coherentes (no se acepta una fecha de salida anterior a la de ingreso; no se aceptan fechas fuera de rangos razonables).
- Toda respuesta de error debe ser clara y distinguir entre error de validación de entrada, error de regla de negocio, y error técnico/de integración con otro servicio.

---

## 13. Integración con Kong (API Gateway)

**Acciones sobre el `docker-compose.yml` existente:**

1. Agregar el nuevo servicio `tickets` (build con su propio Dockerfile) al compose, con sus variables de entorno (conexión a `TicketsDB`, URLs de los demás microservicios, `JWT_SECRET`, `JWT_ISSUER`, `OPA_URL`).
2. Exponer el puerto interno del servicio (por ejemplo `3003:3003`), siguiendo el patrón de puertos ya usado por los demás servicios NestJS.
3. Declarar dependencia de arranque (`depends_on`) sobre `tickets-database` en estado saludable.

**Acciones sobre el script de inicialización de Kong (`kong-init`):**

1. Registrar un nuevo `service` en Kong apuntando a la URL interna del microservicio de tickets (por el nombre del contenedor en la red `kong-net`).
2. Registrar una nueva `route` con el prefijo `/tickets`, con `strip_path=true` (igual que las demás rutas), para que el gateway retire el prefijo antes de reenviar la petición al microservicio.
3. Confirmar que el plugin de CORS ya configurado globalmente cubre también esta nueva ruta (no requiere configuración adicional si el plugin aplica a nivel global).
4. Verificar, tras el despliegue, que las peticiones a `http://<gateway>:8000/tickets/...` lleguen correctamente al microservicio y que las respuestas conserven el formato esperado.

**Acciones sobre Swagger unificado:**

1. Agregar una entrada adicional en la configuración de `swagger-ui` (`URLS`) apuntando al documento OpenAPI del nuevo microservicio de tickets, siguiendo el mismo patrón usado para Usuarios, Vehículos, Zonas y Trazabilidad.

---

## 14. Seguridad y sesión de empleado

**Acciones:**

1. El microservicio de tickets valida el JWT emitido por el servicio de usuarios, usando el mismo `JWT_SECRET` compartido (variable de entorno común a todos los servicios).
2. El `idEmpleado` que queda registrado en cada ticket debe derivarse del token de sesión validado, no confiarse a un campo libre enviado por el cliente en el body, para evitar suplantación.
3. Evaluar el uso de OPA (ya presente en la infraestructura) para políticas de autorización más finas si se requiere (por ejemplo, qué roles pueden anular tickets versus solo emitir/pagar).

---

## 15. Trazabilidad y auditoría

**Acciones:**

1. Registrar internamente cada cambio de estado del ticket con timestamp de actualización (ya contemplado en el modelo de datos).
2. Evaluar si el microservicio de `trazabilidad` existente debe recibir eventos de emisión, pago y anulación de tickets, para mantener el registro histórico centralizado que ya gestiona ese servicio para vehículos y usuarios.
3. Si aplica, definir el contrato de integración saliente (qué información envía `tickets` hacia `trazabilidad` y en qué momento del flujo).

---

## 16. Pruebas y criterios de aceptación

**Acciones:**

1. Pruebas unitarias de cada caso de uso, mockeando los contratos (interfaces) de infraestructura — esto es posible precisamente por la segregación de interfaces aplicada en el diseño.
2. Pruebas de integración que verifiquen el flujo completo: emitir → intentar emitir duplicado (mismo espacio, misma placa, ambos) → debe fallar; emitir → pagar → intentar pagar de nuevo → debe fallar; emitir → anular → intentar anular de nuevo → debe fallar.
3. Pruebas de la resolución cédula/placa: un vehículo, más de un vehículo, ningún vehículo.
4. Pruebas del generador de código de ticket: formato de 16 dígitos, unicidad ante ejecuciones consecutivas rápidas.
5. Pruebas end-to-end a través del gateway Kong, confirmando que la ruta `/tickets` enruta correctamente y que el `strip_path` no rompe los endpoints internos.

---

## 17. Resumen de entregables

- Nuevo servicio `tickets-database` en el compose, con volumen y healthcheck propios.
- Nuevo microservicio `tickets` (NestJS), con arquitectura por capas (dominio, aplicación, infraestructura, interfaz).
- DTOs separados en `request` y `response`, con validación y sanitización estrictas.
- Generador de código único de 16 dígitos.
- Componente de tarifas configurable por variables de entorno.
- Reglas de negocio de emisión, pago y anulación implementadas como casos de uso independientes.
- Integración completa con Kong: servicio, ruta `/tickets`, y entrada correspondiente en Swagger unificado.
- Suite de pruebas cubriendo reglas de negocio y validaciones críticas.
