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
exports.AnularTicketRequestDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class AnularTicketRequestDto {
}
exports.AnularTicketRequestDto = AnularTicketRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-del-ticket', description: 'UUID del ticket (opcional si se envía código)' }),
    (0, class_validator_1.ValidateIf)(o => !o.codigoTicket),
    (0, class_validator_1.IsNotEmpty)({ message: 'Debe proporcionar el idTicket si no proporciona el codigoTicket' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsUUID)('4', { message: 'El idTicket debe ser un UUID válido' }),
    __metadata("design:type", String)
], AnularTicketRequestDto.prototype, "idTicket", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1000012345678901', description: 'Código único de 16 dígitos del ticket (opcional si se envía id)' }),
    (0, class_validator_1.ValidateIf)(o => !o.idTicket),
    (0, class_validator_1.IsNotEmpty)({ message: 'Debe proporcionar el codigoTicket si no proporciona el idTicket' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(16),
    __metadata("design:type", String)
], AnularTicketRequestDto.prototype, "codigoTicket", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Cliente no encontró espacio', description: 'Motivo de la anulación' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El motivo de anulación es obligatorio' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], AnularTicketRequestDto.prototype, "motivo", void 0);
//# sourceMappingURL=anular-ticket-request.dto.js.map