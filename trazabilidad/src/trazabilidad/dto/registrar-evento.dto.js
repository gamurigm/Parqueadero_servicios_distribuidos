"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrarEventoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const trazabilidad_entity_1 = require("../entities/trazabilidad.entity");
class RegistrarEventoDto {
}
exports.RegistrarEventoDto = RegistrarEventoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Microservicio de origen del evento',
        enum: trazabilidad_entity_1.Microservicio,
        example: trazabilidad_entity_1.Microservicio.VEHICULOS,
    }),
    (0, class_validator_1.IsEnum)(trazabilidad_entity_1.Microservicio, { message: 'El microservicio debe ser uno válido: TRAZABILIDAD, USUARIOS, VEHICULOS, ZONAS, TICKETS' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "microservicio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Endpoint que generó el evento (e.g. "POST /vehiculos")',
        example: 'POST /vehiculos',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "endpoint", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Método HTTP utilizado',
        example: 'POST',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "metodoHttp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de acción realizada',
        enum: trazabilidad_entity_1.TipoAccion,
        example: trazabilidad_entity_1.TipoAccion.CREACION,
    }),
    (0, class_validator_1.IsEnum)(trazabilidad_entity_1.TipoAccion, { message: 'El tipo de acción debe ser válido' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "tipoAccion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Descripción legible del evento (e.g. "Se creó vehículo Toyota Corolla placa ABC-123")',
        example: 'Se creó vehículo Toyota Corolla placa ABC-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID de la entidad afectada (UUID o referencia)',
        example: 'b4e2c3d5-5678-4def-90ef-234567890bcd',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "entidadId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID del usuario que ejecutó la acción (UUID del JWT)',
        example: 'a3f1b2c4-1234-4abc-89de-1234567890ab',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "usuarioEjecutor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nombre legible del usuario que ejecutó la acción',
        example: 'admin',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "usuarioEjecutorNombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID del propietario afectado (solo para eventos de asignaciones)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID del vehículo afectado (solo para eventos de asignaciones)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegistrarEventoDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estado/payload anterior al cambio (null en CREACION)',
        example: null,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], RegistrarEventoDto.prototype, "payloadAnterior", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estado/payload nuevo después del cambio (null en ELIMINACION)',
        example: { placa: 'ABC-123', marca: 'Toyota', modelo: 'Corolla' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], RegistrarEventoDto.prototype, "payloadNuevo", void 0);
//# sourceMappingURL=registrar-evento.dto.js.map