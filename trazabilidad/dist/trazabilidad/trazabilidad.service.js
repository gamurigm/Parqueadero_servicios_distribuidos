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
var TrazabilidadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrazabilidadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const trazabilidad_entity_1 = require("./entities/trazabilidad.entity");
const vehiculos_client_service_1 = require("../vehiculos-client/vehiculos-client.service");
const usuarios_client_service_1 = require("../usuarios-client/usuarios-client.service");
let TrazabilidadService = TrazabilidadService_1 = class TrazabilidadService {
    constructor(trazabilidadRepo, vehiculosClientService, usuariosClientService) {
        this.trazabilidadRepo = trazabilidadRepo;
        this.vehiculosClientService = vehiculosClientService;
        this.usuariosClientService = usuariosClientService;
        this.logger = new common_1.Logger(TrazabilidadService_1.name);
    }
    async registrarEvento(dto) {
        const evento = this.trazabilidadRepo.create({
            microservicio: dto.microservicio,
            endpoint: dto.endpoint,
            metodoHttp: dto.metodoHttp,
            tipoAccion: dto.tipoAccion,
            descripcion: dto.descripcion,
            entidadId: dto.entidadId ?? null,
            usuarioEjecutor: dto.usuarioEjecutor ?? null,
            usuarioEjecutorNombre: dto.usuarioEjecutorNombre ?? null,
            userId: dto.userId ?? null,
            vehicleId: dto.vehicleId ?? null,
            payloadAnterior: dto.payloadAnterior ?? null,
            payloadNuevo: dto.payloadNuevo ?? null,
        });
        const saved = await this.trazabilidadRepo.save(evento);
        this.logger.log(`[${dto.microservicio}] ${dto.metodoHttp} ${dto.endpoint} - ${dto.tipoAccion}: ${dto.descripcion}`);
        return saved;
    }
    async registrar(tipo, userId, vehicleId, descripcion, payloadAnterior, payloadNuevo) {
        return this.registrarEvento({
            microservicio: trazabilidad_entity_1.Microservicio.TRAZABILIDAD,
            endpoint: tipo === trazabilidad_entity_1.TipoAccion.CREACION
                ? 'POST /asignaciones'
                : tipo === trazabilidad_entity_1.TipoAccion.MODIFICACION
                    ? 'PUT /asignaciones'
                    : 'DELETE /asignaciones',
            metodoHttp: tipo === trazabilidad_entity_1.TipoAccion.CREACION
                ? 'POST'
                : tipo === trazabilidad_entity_1.TipoAccion.MODIFICACION
                    ? 'PUT'
                    : 'DELETE',
            tipoAccion: tipo,
            descripcion,
            userId,
            vehicleId,
            payloadAnterior,
            payloadNuevo,
        });
    }
    async listarPorAsignacion(userId, vehicleId, authHeader) {
        const eventos = await this.trazabilidadRepo.find({
            where: { userId, vehicleId },
            order: { timestamp: 'DESC' },
        });
        return this.enriquecerEventos(eventos, authHeader);
    }
    async listarPorPropietario(userId, authHeader) {
        const eventos = await this.trazabilidadRepo.find({
            where: { userId },
            order: { timestamp: 'DESC' },
        });
        return this.enriquecerEventos(eventos, authHeader);
    }
    async listarTodos(authHeader) {
        const eventos = await this.trazabilidadRepo.find({
            order: { timestamp: 'DESC' },
        });
        return this.enriquecerEventos(eventos, authHeader);
    }
    async listarPorMicroservicio(microservicio, authHeader) {
        const eventos = await this.trazabilidadRepo.find({
            where: { microservicio },
            order: { timestamp: 'DESC' },
        });
        return this.enriquecerEventos(eventos, authHeader);
    }
    async enriquecerEventos(eventos, authHeader) {
        const userIds = [...new Set(eventos.map(e => e.userId).filter(Boolean))];
        const vehicleIds = [...new Set(eventos.map(e => e.vehicleId).filter(Boolean))];
        const usersMap = new Map();
        const vehiclesMap = new Map();
        await Promise.all([
            ...userIds.map(async (uid) => {
                try {
                    const userData = await this.usuariosClientService.obtenerUsuario(uid, authHeader);
                    if (userData)
                        usersMap.set(uid, userData);
                }
                catch (error) {
                    this.logger.warn(`No se pudo obtener datos del usuario ${uid}: ${error.message}`);
                }
            }),
            ...vehicleIds.map(async (vid) => {
                try {
                    const vehiculoData = await this.vehiculosClientService.getVehiculo(vid, authHeader);
                    if (vehiculoData)
                        vehiclesMap.set(vid, vehiculoData);
                }
                catch (error) {
                    this.logger.warn(`No se pudo obtener datos del vehículo ${vid}: ${error.message}`);
                }
            }),
        ]);
        return eventos.map((evento) => {
            const userData = evento.userId ? usersMap.get(evento.userId) : null;
            const vehiculoData = evento.vehicleId ? vehiclesMap.get(evento.vehicleId) : null;
            return {
                id: evento.id,
                microservicio: evento.microservicio,
                endpoint: evento.endpoint,
                metodoHttp: evento.metodoHttp,
                tipoAccion: evento.tipoAccion,
                descripcion: evento.descripcion,
                entidadId: evento.entidadId,
                usuarioEjecutor: evento.usuarioEjecutor,
                usuarioEjecutorNombre: evento.usuarioEjecutorNombre,
                timestamp: evento.timestamp,
                propietario: evento.userId
                    ? {
                        id: evento.userId,
                        username: userData?.username ?? 'No disponible',
                        nombre: userData?.nombre ?? userData?.username ?? 'No disponible',
                    }
                    : null,
                vehiculo: evento.vehicleId
                    ? {
                        id: evento.vehicleId,
                        placa: vehiculoData?.placa ?? 'No disponible',
                        marca: vehiculoData?.marca ?? 'No disponible',
                        modelo: vehiculoData?.modelo ?? 'No disponible',
                        tipo: vehiculoData?.tipo ?? 'No disponible',
                    }
                    : null,
                payloadAnterior: evento.payloadAnterior,
                payloadNuevo: evento.payloadNuevo,
            };
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
exports.TrazabilidadService = TrazabilidadService = TrazabilidadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(trazabilidad_entity_1.EventoTrazabilidad)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        vehiculos_client_service_1.VehiculosClientService,
        usuarios_client_service_1.UsuariosClientService])
], TrazabilidadService);
//# sourceMappingURL=trazabilidad.service.js.map