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
exports.PagoResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class PagoResponseDto {
}
exports.PagoResponseDto = PagoResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-del-ticket' }),
    __metadata("design:type", String)
], PagoResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1000012345678901' }),
    __metadata("design:type", String)
], PagoResponseDto.prototype, "codigoTicket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PAGADO' }),
    __metadata("design:type", String)
], PagoResponseDto.prototype, "estado", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-01T10:00:00Z' }),
    __metadata("design:type", Date)
], PagoResponseDto.prototype, "fechaIngreso", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-01T12:30:00Z' }),
    __metadata("design:type", Date)
], PagoResponseDto.prototype, "fechaSalida", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5.00 }),
    __metadata("design:type", Number)
], PagoResponseDto.prototype, "valorRecaudado", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], PagoResponseDto.prototype, "horasCobradas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2.50 }),
    __metadata("design:type", Number)
], PagoResponseDto.prototype, "tarifaPorHora", void 0);
//# sourceMappingURL=pago-response.dto.js.map