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
exports.EmitirTicketRequestDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class EmitirTicketRequestDto {
}
exports.EmitirTicketRequestDto = EmitirTicketRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ESP-001', description: 'ID del espacio de parqueo' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El idEspacio no puede estar vacío' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsUUID)('4', { message: 'El idEspacio debe ser un UUID válido' }),
    __metadata("design:type", String)
], EmitirTicketRequestDto.prototype, "idEspacio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1234567890', description: 'Cédula del propietario (opcional si se envía placa)' }),
    (0, class_validator_1.ValidateIf)(o => !o.placa),
    (0, class_validator_1.IsNotEmpty)({ message: 'Debe proporcionar la cédula si no proporciona la placa' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{6,20}$/, { message: 'La cédula debe contener solo dígitos' }),
    __metadata("design:type", String)
], EmitirTicketRequestDto.prototype, "cedula", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ABC-1234', description: 'Placa del vehículo (opcional si se envía cédula)' }),
    (0, class_validator_1.ValidateIf)(o => !o.cedula),
    (0, class_validator_1.IsNotEmpty)({ message: 'Debe proporcionar la placa si no proporciona la cédula' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], EmitirTicketRequestDto.prototype, "placa", void 0);
//# sourceMappingURL=emitir-ticket-request.dto.js.map