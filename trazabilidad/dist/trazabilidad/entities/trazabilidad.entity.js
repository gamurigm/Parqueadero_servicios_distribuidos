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
exports.EventoTrazabilidad = exports.TipoAccion = void 0;
const typeorm_1 = require("typeorm");
var TipoAccion;
(function (TipoAccion) {
    TipoAccion["CREACION"] = "CREACION";
    TipoAccion["MODIFICACION"] = "MODIFICACION";
    TipoAccion["ELIMINACION"] = "ELIMINACION";
})(TipoAccion || (exports.TipoAccion = TipoAccion = {}));
let EventoTrazabilidad = class EventoTrazabilidad {
};
exports.EventoTrazabilidad = EventoTrazabilidad;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EventoTrazabilidad.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    __metadata("design:type", String)
], EventoTrazabilidad.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'vehicle_id' }),
    __metadata("design:type", String)
], EventoTrazabilidad.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TipoAccion,
        name: 'tipo_accion',
    }),
    __metadata("design:type", String)
], EventoTrazabilidad.prototype, "tipoAccion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'timestamp', type: 'timestamptz' }),
    __metadata("design:type", Date)
], EventoTrazabilidad.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'payload_anterior', nullable: true }),
    __metadata("design:type", Object)
], EventoTrazabilidad.prototype, "payloadAnterior", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'payload_nuevo', nullable: true }),
    __metadata("design:type", Object)
], EventoTrazabilidad.prototype, "payloadNuevo", void 0);
exports.EventoTrazabilidad = EventoTrazabilidad = __decorate([
    (0, typeorm_1.Entity)('eventos_trazabilidad')
], EventoTrazabilidad);
//# sourceMappingURL=trazabilidad.entity.js.map