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
exports.TicketEntity = exports.TicketEstado = void 0;
const typeorm_1 = require("typeorm");
var TicketEstado;
(function (TicketEstado) {
    TicketEstado["ACTIVO"] = "ACTIVO";
    TicketEstado["PAGADO"] = "PAGADO";
    TicketEstado["ANULADO"] = "ANULADO";
})(TicketEstado || (exports.TicketEstado = TicketEstado = {}));
let TicketEntity = class TicketEntity {
};
exports.TicketEntity = TicketEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TicketEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_ticket', length: 16, unique: true }),
    __metadata("design:type", String)
], TicketEntity.prototype, "codigoTicket", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_espacio', length: 50 }),
    __metadata("design:type", String)
], TicketEntity.prototype, "idEspacio", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], TicketEntity.prototype, "cedula", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], TicketEntity.prototype, "placa", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TicketEstado,
        default: TicketEstado.ACTIVO,
    }),
    __metadata("design:type", String)
], TicketEntity.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_ingreso', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TicketEntity.prototype, "fechaIngreso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_salida', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], TicketEntity.prototype, "fechaSalida", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_empleado', length: 50 }),
    __metadata("design:type", String)
], TicketEntity.prototype, "idEmpleado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_empleado_pago', length: 50, nullable: true }),
    __metadata("design:type", String)
], TicketEntity.prototype, "idEmpleadoPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_empleado_anula', length: 50, nullable: true }),
    __metadata("design:type", String)
], TicketEntity.prototype, "idEmpleadoAnula", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valor_recaudado', type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], TicketEntity.prototype, "valorRecaudado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo_anulacion', length: 500, nullable: true }),
    __metadata("design:type", String)
], TicketEntity.prototype, "motivoAnulacion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TicketEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TicketEntity.prototype, "updatedAt", void 0);
exports.TicketEntity = TicketEntity = __decorate([
    (0, typeorm_1.Entity)('tickets'),
    (0, typeorm_1.Index)(['idEspacio', 'estado'], { unique: true, where: "estado = 'ACTIVO'" }),
    (0, typeorm_1.Index)(['placa', 'estado'], { unique: true, where: "estado = 'ACTIVO'" })
], TicketEntity);
//# sourceMappingURL=ticket.entity.js.map