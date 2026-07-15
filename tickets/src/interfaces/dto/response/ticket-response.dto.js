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
exports.TicketResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class TicketResponseDto {
}
exports.TicketResponseDto = TicketResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-del-ticket' }),
    __metadata("design:type", String)
], TicketResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1000012345678901' }),
    __metadata("design:type", String)
], TicketResponseDto.prototype, "codigoTicket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ESP-001' }),
    __metadata("design:type", String)
], TicketResponseDto.prototype, "idEspacio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234567890', required: false }),
    __metadata("design:type", String)
], TicketResponseDto.prototype, "cedula", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ABC-1234' }),
    __metadata("design:type", String)
], TicketResponseDto.prototype, "placa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACTIVO', enum: ['ACTIVO', 'PAGADO', 'ANULADO'] }),
    __metadata("design:type", String)
], TicketResponseDto.prototype, "estado", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-01T10:00:00Z' }),
    __metadata("design:type", Date)
], TicketResponseDto.prototype, "fechaIngreso", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-07-01T12:30:00Z' }),
    __metadata("design:type", Date)
], TicketResponseDto.prototype, "fechaSalida", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5.00 }),
    __metadata("design:type", Number)
], TicketResponseDto.prototype, "valorRecaudado", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Cliente no encontró espacio' }),
    __metadata("design:type", String)
], TicketResponseDto.prototype, "motivoAnulacion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EMP-001' }),
    __metadata("design:type", String)
], TicketResponseDto.prototype, "idEmpleado", void 0);
//# sourceMappingURL=ticket-response.dto.js.map