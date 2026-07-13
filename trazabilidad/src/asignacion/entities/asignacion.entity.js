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
exports.Asignacion = void 0;
const typeorm_1 = require("typeorm");
let Asignacion = class Asignacion {
};
exports.Asignacion = Asignacion;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid', name: 'user_id' }),
    __metadata("design:type", String)
], Asignacion.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid', name: 'vehicle_id' }),
    __metadata("design:type", String)
], Asignacion.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Asignacion.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Asignacion.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'fecha_asignacion', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Asignacion.prototype, "fechaAsignacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'fecha_modificacion', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Asignacion.prototype, "fechaModificacion", void 0);
exports.Asignacion = Asignacion = __decorate([
    (0, typeorm_1.Entity)('asignaciones')
], Asignacion);
//# sourceMappingURL=asignacion.entity.js.map