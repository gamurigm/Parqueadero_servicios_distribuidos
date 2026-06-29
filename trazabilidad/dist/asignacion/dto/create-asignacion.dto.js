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
exports.CreateAsignacionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateAsignacionDto {
}
exports.CreateAsignacionDto = CreateAsignacionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del propietario (UUID del microservicio de Usuarios)',
        example: 'a3f1b2c4-1234-4abc-89de-1234567890ab',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAsignacionDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del vehículo (UUID del microservicio de Vehículos)',
        example: 'b4e2c3d5-5678-4def-90ef-234567890bcd',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAsignacionDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Descripcion adicionales sobre la asignación',
        example: 'Vehículo asignado para estacionamiento zona norte',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAsignacionDto.prototype, "descripcion", void 0);
//# sourceMappingURL=create-asignacion.dto.js.map