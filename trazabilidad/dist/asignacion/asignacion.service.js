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
exports.AsignacionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const asignacion_entity_1 = require("./entities/asignacion.entity");
const factory_asignacion_1 = require("./factory/factory-asignacion");
const trazabilidad_service_1 = require("../trazabilidad/trazabilidad.service");
const trazabilidad_entity_1 = require("../trazabilidad/entities/trazabilidad.entity");
const vehiculos_client_service_1 = require("../vehiculos-client/vehiculos-client.service");
const usuarios_client_service_1 = require("../usuarios-client/usuarios-client.service");
const utils_1 = require("../utils/utils");
let AsignacionService = class AsignacionService {
    constructor(asignacionRepo, trazabilidadService, vehiculosClientService, usuariosClientService) {
        this.asignacionRepo = asignacionRepo;
        this.trazabilidadService = trazabilidadService;
        this.vehiculosClientService = vehiculosClientService;
        this.usuariosClientService = usuariosClientService;
        this.utils = new utils_1.Utils();
    }
    async crear(dto) {
        const userId = this.utils.validateUUID(dto.userId);
        const vehicleId = this.utils.validateUUID(dto.vehicleId);
        await this.usuariosClientService.validarPropietario(userId);
        const vehiculoDetalle = await this.vehiculosClientService.getVehiculo(vehicleId);
        if (!vehiculoDetalle) {
            throw new common_1.NotFoundException(`El vehículo con ID ${vehicleId} no existe en el sistema`);
        }
        const asignacionExistente = await this.asignacionRepo.findOne({
            where: { userId, vehicleId },
        });
        if (asignacionExistente) {
            throw new common_1.ConflictException(`Ya existe una asignación para el usuario ${userId} con el vehículo ${vehicleId}`);
        }
        const vehiculoActivo = await this.asignacionRepo.findOne({
            where: { vehicleId, estado: 1 },
        });
        if (vehiculoActivo) {
            throw new common_1.ConflictException(`El vehículo ${vehicleId} ya está asignado activamente al propietario ${vehiculoActivo.userId}`);
        }
        if (dto.descripcion) {
            dto.descripcion = this.utils.sanitizeText(dto.descripcion);
        }
        const asignacion = factory_asignacion_1.FactoryAsignacion.crear({ ...dto, userId, vehicleId });
        const saved = await this.asignacionRepo.save(asignacion);
        const vehiculoInfo = vehiculoDetalle ? `${vehiculoDetalle.marca ?? ''} ${vehiculoDetalle.modelo ?? ''} (${vehiculoDetalle.placa ?? 'sin placa'})`.trim() : vehicleId;
        await this.trazabilidadService.registrar(trazabilidad_entity_1.TipoAccion.CREACION, saved.userId, saved.vehicleId, `Se creó asignación del vehículo ${vehiculoInfo} al propietario ${saved.userId}`, null, trazabilidad_service_1.TrazabilidadService.serializarAsignacion(saved));
        return saved;
    }
    async listar() {
        return await this.asignacionRepo.find({
            order: { fechaAsignacion: 'DESC' },
        });
    }
    async buscarPorClave(userId, vehicleId) {
        const uid = this.utils.validateUUID(userId);
        const vid = this.utils.validateUUID(vehicleId);
        const asignacion = await this.asignacionRepo.findOne({
            where: { userId: uid, vehicleId: vid },
        });
        if (!asignacion) {
            throw new common_1.NotFoundException(`No se encontró asignación para usuario ${uid} y vehículo ${vid}`);
        }
        return asignacion;
    }
    async actualizar(userId, vehicleId, dto) {
        const uid = this.utils.validateUUID(userId);
        const vid = this.utils.validateUUID(vehicleId);
        const asignacion = await this.asignacionRepo.findOne({
            where: { userId: uid, vehicleId: vid },
        });
        if (!asignacion) {
            throw new common_1.NotFoundException(`No se encontró asignación para usuario ${uid} y vehículo ${vid}`);
        }
        const sinCambios = (dto.estado === undefined || dto.estado === asignacion.estado) &&
            (dto.descripcion === undefined || dto.descripcion === asignacion.descripcion);
        if (sinCambios) {
            throw new common_1.BadRequestException('No se detectaron cambios en los valores enviados');
        }
        if (dto.estado === 1 && asignacion.estado === 0) {
            const otroActivo = await this.asignacionRepo.findOne({
                where: { vehicleId: vid, estado: 1 },
            });
            if (otroActivo && otroActivo.userId !== uid) {
                throw new common_1.ConflictException(`El vehículo ya está activo para otro propietario: ${otroActivo.userId}`);
            }
        }
        const payloadAnterior = trazabilidad_service_1.TrazabilidadService.serializarAsignacion(asignacion);
        if (dto.estado !== undefined)
            asignacion.estado = dto.estado;
        if (dto.descripcion !== undefined)
            asignacion.descripcion = this.utils.sanitizeText(dto.descripcion);
        const saved = await this.asignacionRepo.save(asignacion);
        const cambios = [];
        if (dto.estado !== undefined)
            cambios.push(`estado: ${dto.estado === 1 ? 'Activo' : 'Inactivo'}`);
        if (dto.descripcion !== undefined)
            cambios.push(`descripción actualizada`);
        await this.trazabilidadService.registrar(trazabilidad_entity_1.TipoAccion.MODIFICACION, saved.userId, saved.vehicleId, `Se modificó asignación usuario=${saved.userId} / vehículo=${saved.vehicleId} - Cambios: ${cambios.join(', ')}`, payloadAnterior, trazabilidad_service_1.TrazabilidadService.serializarAsignacion(saved));
        return saved;
    }
    async eliminar(userId, vehicleId) {
        const uid = this.utils.validateUUID(userId);
        const vid = this.utils.validateUUID(vehicleId);
        const asignacion = await this.asignacionRepo.findOne({
            where: { userId: uid, vehicleId: vid },
        });
        if (!asignacion) {
            throw new common_1.NotFoundException(`No se encontró asignación para usuario ${uid} y vehículo ${vid}`);
        }
        const payloadAnterior = trazabilidad_service_1.TrazabilidadService.serializarAsignacion(asignacion);
        await this.asignacionRepo.remove(asignacion);
        await this.trazabilidadService.registrar(trazabilidad_entity_1.TipoAccion.ELIMINACION, uid, vid, `Se eliminó asignación usuario=${uid} / vehículo=${vid}`, payloadAnterior, null);
        return { message: `Asignación usuario=${uid} / vehículo=${vid} eliminada exitosamente` };
    }
    async obtenerFlotaPorPropietario(userId) {
        const uid = this.utils.validateUUID(userId);
        const asignaciones = await this.asignacionRepo.find({
            where: { userId: uid, estado: 1 },
            order: { fechaAsignacion: 'DESC' },
        });
        if (asignaciones.length === 0) {
            return [];
        }
        const flota = await Promise.all(asignaciones.map(async (asignacion) => {
            const vehiculoDetalle = await this.vehiculosClientService.getVehiculo(asignacion.vehicleId);
            if (vehiculoDetalle) {
                return {
                    id: vehiculoDetalle.id,
                    tipo: vehiculoDetalle.tipo,
                    categoria: vehiculoDetalle.categoria,
                    marca: vehiculoDetalle.marca ?? null,
                    modelo: vehiculoDetalle.modelo ?? null,
                    placa: vehiculoDetalle.placa ?? null,
                    fechaAsignacion: asignacion.fechaAsignacion,
                    estadoAsignacion: asignacion.estado === 1 ? 'Activo' : 'Inactivo'
                };
            }
            else {
                return {
                    id: asignacion.vehicleId,
                    error: 'Servicio de vehículos no disponible o vehículo eliminado',
                    fechaAsignacion: asignacion.fechaAsignacion
                };
            }
        }));
        return flota;
    }
};
exports.AsignacionService = AsignacionService;
exports.AsignacionService = AsignacionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(asignacion_entity_1.Asignacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        trazabilidad_service_1.TrazabilidadService,
        vehiculos_client_service_1.VehiculosClientService,
        usuarios_client_service_1.UsuariosClientService])
], AsignacionService);
//# sourceMappingURL=asignacion.service.js.map