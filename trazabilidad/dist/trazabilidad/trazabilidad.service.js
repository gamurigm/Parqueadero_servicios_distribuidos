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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrazabilidadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const trazabilidad_entity_1 = require("./entities/trazabilidad.entity");
let TrazabilidadService = class TrazabilidadService {
    constructor(trazabilidadRepo) {
        this.trazabilidadRepo = trazabilidadRepo;
    }
    async registrar(tipo, userId, vehicleId, payloadAnterior, payloadNuevo) {
        const evento = this.trazabilidadRepo.create({
            userId,
            vehicleId,
            tipoAccion: tipo,
            payloadAnterior,
            payloadNuevo,
        });
        return await this.trazabilidadRepo.save(evento);
    }
    async listarPorAsignacion(userId, vehicleId) {
        return await this.trazabilidadRepo.find({
            where: { userId, vehicleId },
            order: { timestamp: 'DESC' },
        });
    }
    async listarPorPropietario(userId) {
        return await this.trazabilidadRepo.find({
            where: { userId },
            order: { timestamp: 'DESC' },
        });
    }
    async listarTodos() {
        return await this.trazabilidadRepo.find({
            order: { timestamp: 'DESC' },
        });
    }
    static serializarAsignacion(asignacion) {
        return {
            userId: asignacion.userId,
            vehicleId: asignacion.vehicleId,
            estado: asignacion.estado,
            descripcion: asignacion.descripcion,
            fechaAsignacion: asignacion.fechaAsignacion,
            fechaModificacion: asignacion.fechaModificacion,
        };
    }
};
exports.TrazabilidadService = TrazabilidadService;
exports.TrazabilidadService = TrazabilidadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(trazabilidad_entity_1.EventoTrazabilidad)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TrazabilidadService);
//# sourceMappingURL=trazabilidad.service.js.map