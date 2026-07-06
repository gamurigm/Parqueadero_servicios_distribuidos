# Microservicio de Tickets

## Descripción
Microservicio encargado de la emisión, pago y anulación de tickets de parqueo. Sigue los principios de Domain-Driven Design (DDD) y Clean Architecture.

## Configuración y Ejecución

1. Crear un archivo `.env` basado en las configuraciones necesarias (se provee uno por defecto).
2. Instalar dependencias: `npm install`
3. Ejecutar en desarrollo: `npm run start:dev`

## Endpoints (vía API Gateway /tickets)

- `POST /emitir` - Emite un nuevo ticket. Requiere validación de cédula o placa.
- `POST /pagar` - Paga un ticket existente (cambia estado a PAGADO).
- `POST /anular` - Anula un ticket emitido por error (hasta 15 minutos).
- `GET /:id` - Consulta ticket por UUID.
- `GET /codigo/:codigo` - Consulta ticket por código de 16 dígitos.

## Integraciones
Se comunica con:
- Zonas (Java/Spring Boot)
- Vehículos (NestJS)
- Usuarios (NestJS)
- Trazabilidad (NestJS) para auditoría.
