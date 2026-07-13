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
    async crear(dto, authHeader) {
        const userId = this.utils.validateUUID(dto.userId);
        const vehicleId = this.utils.validateUUID(dto.vehicleId);
        const propietario = await this.usuariosClientService.validarPropietario(userId, authHeader);
        const vehiculoDetalle = await this.vehiculosClientService.getVehiculo(vehicleId, authHeader);
        if (!vehiculoDetalle) {
            throw new common_1.NotFoundException(`El vehiculo con ID ${vehicleId} no existe en el sistema`);
        }
        const asignacionExistente = await this.asignacionRepo.findOne({
            where: { userId, vehicleId },
        });
        if (asignacionExistente) {
            throw new common_1.ConflictException(`Ya existe una asignacion para el usuario ${userId} con el vehiculo ${vehicleId}`);
        }
        const vehiculoActivo = await this.asignacionRepo.findOne({
            where: { vehicleId, estado: 1 },
        });
        if (vehiculoActivo) {
            throw new common_1.ConflictException(`El vehiculo ${vehicleId} ya esta asignado activamente al propietario ${vehiculoActivo.userId}`);
        }
        if (dto.descripcion) {
            dto.descripcion = this.utils.sanitizeText(dto.descripcion);
        }
        const asignacion = factory_asignacion_1.FactoryAsignacion.crear({ ...dto, userId, vehicleId });
        const saved = await this.asignacionRepo.save(asignacion);
        const propietarioNombre = this.obtenerNombrePropietario(propietario);
        const vehiculoInfo = this.obtenerEtiquetaVehiculo(vehicleId, vehiculoDetalle);
        await this.trazabilidadService.registrar(trazabilidad_entity_1.TipoAccion.CREACION, saved.userId, saved.vehicleId, `Se creo asignacion del vehiculo ${vehiculoInfo} al propietario ${propietarioNombre}`, null, trazabilidad_service_1.TrazabilidadService.serializarAsignacion(saved));
        return this.enriquecerAsignacion(saved, authHeader, propietario, vehiculoDetalle);
    }
    async listar(authHeader) {
        const asignaciones = await this.asignacionRepo.find({
            order: { fechaAsignacion: 'DESC' },
        });
        return Promise.all(asignaciones.map((asignacion) => this.enriquecerAsignacion(asignacion, authHeader)));
    }
    async buscarPorClave(userId, vehicleId, authHeader) {
        const uid = this.utils.validateUUID(userId);
        const vid = this.utils.validateUUID(vehicleId);
        const asignacion = await this.asignacionRepo.findOne({
            where: { userId: uid, vehicleId: vid },
        });
        if (!asignacion) {
            throw new common_1.NotFoundException(`No se encontro asignacion para usuario ${uid} y vehiculo ${vid}`);
        }
        return this.enriquecerAsignacion(asignacion, authHeader);
    }
    async actualizar(userId, vehicleId, dto, authHeader) {
        const uid = this.utils.validateUUID(userId);
        const vid = this.utils.validateUUID(vehicleId);
        const asignacion = await this.asignacionRepo.findOne({
            where: { userId: uid, vehicleId: vid },
        });
        if (!asignacion) {
            throw new common_1.NotFoundException(`No se encontro asignacion para usuario ${uid} y vehiculo ${vid}`);
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
                throw new common_1.ConflictException(`El vehiculo ya esta activo para otro propietario: ${otroActivo.userId}`);
            }
        }
        const payloadAnterior = trazabilidad_service_1.TrazabilidadService.serializarAsignacion(asignacion);
        if (dto.estado !== undefined)
            asignacion.estado = dto.estado;
        if (dto.descripcion !== undefined)
            asignacion.descripcion = this.utils.sanitizeText(dto.descripcion);
        const saved = await this.asignacionRepo.save(asignacion);
        const propietario = await this.usuariosClientService.obtenerUsuario(saved.userId, authHeader);
        const vehiculoDetalle = await this.vehiculosClientService.getVehiculo(saved.vehicleId, authHeader);
        const propietarioNombre = this.obtenerNombrePropietario(propietario);
        const vehiculoInfo = this.obtenerEtiquetaVehiculo(saved.vehicleId, vehiculoDetalle);
        const cambios = [];
        if (dto.estado !== undefined)
            cambios.push(`estado: ${dto.estado === 1 ? 'Activo' : 'Inactivo'}`);
        if (dto.descripcion !== undefined)
            cambios.push('descripcion actualizada');
        await this.trazabilidadService.registrar(trazabilidad_entity_1.TipoAccion.MODIFICACION, saved.userId, saved.vehicleId, `Se modifico asignacion de ${propietarioNombre} sobre ${vehiculoInfo} - Cambios: ${cambios.join(', ')}`, payloadAnterior, trazabilidad_service_1.TrazabilidadService.serializarAsignacion(saved));
        return this.enriquecerAsignacion(saved, authHeader, propietario, vehiculoDetalle);
    }
    async eliminar(userId, vehicleId, authHeader) {
        const uid = this.utils.validateUUID(userId);
        const vid = this.utils.validateUUID(vehicleId);
        const asignacion = await this.asignacionRepo.findOne({
            where: { userId: uid, vehicleId: vid },
        });
        if (!asignacion) {
            throw new common_1.NotFoundException(`No se encontro asignacion para usuario ${uid} y vehiculo ${vid}`);
        }
        const payloadAnterior = trazabilidad_service_1.TrazabilidadService.serializarAsignacion(asignacion);
        const propietario = await this.usuariosClientService.obtenerUsuario(asignacion.userId, authHeader);
        const vehiculoDetalle = await this.vehiculosClientService.getVehiculo(asignacion.vehicleId, authHeader);
        const propietarioNombre = this.obtenerNombrePropietario(propietario);
        const vehiculoInfo = this.obtenerEtiquetaVehiculo(asignacion.vehicleId, vehiculoDetalle);
        await this.asignacionRepo.remove(asignacion);
        await this.trazabilidadService.registrar(trazabilidad_entity_1.TipoAccion.ELIMINACION, uid, vid, `Se elimino asignacion de ${propietarioNombre} sobre ${vehiculoInfo}`, payloadAnterior, null);
        return { message: `Asignacion de ${propietarioNombre} sobre ${vehiculoInfo} eliminada exitosamente` };
    }
    async obtenerFlotaPorPropietario(userId, authHeader) {
        const uid = this.utils.validateUUID(userId);
        const asignaciones = await this.asignacionRepo.find({
            where: { userId: uid, estado: 1 },
            order: { fechaAsignacion: 'DESC' },
        });
        if (asignaciones.length === 0) {
            return [];
        }
        const flota = await Promise.all(asignaciones.map(async (asignacion) => {
            const vehiculoDetalle = await this.vehiculosClientService.getVehiculo(asignacion.vehicleId, authHeader);
            if (vehiculoDetalle) {
                return {
                    id: vehiculoDetalle.id,
                    tipo: vehiculoDetalle.tipo,
                    categoria: vehiculoDetalle.categoria,
                    marca: vehiculoDetalle.marca ?? null,
                    modelo: vehiculoDetalle.modelo ?? null,
                    placa: vehiculoDetalle.placa ?? null,
                    fechaAsignacion: asignacion.fechaAsignacion,
                    estadoAsignacion: asignacion.estado === 1 ? 'Activo' : 'Inactivo',
                };
            }
            return {
                id: asignacion.vehicleId,
                error: 'Servicio de vehiculos no disponible o vehiculo eliminado',
                fechaAsignacion: asignacion.fechaAsignacion,
            };
        }));
        return flota;
    }
    async enriquecerAsignacion(asignacion, authHeader, propietario, vehiculoDetalle) {
        const userData = propietario ?? await this.usuariosClientService.obtenerUsuario(asignacion.userId, authHeader);
        const vehiculoData = vehiculoDetalle ?? await this.vehiculosClientService.getVehiculo(asignacion.vehicleId, authHeader);
        return {
            userId: asignacion.userId,
            vehicleId: asignacion.vehicleId,
            estado: asignacion.estado,
            estadoTexto: asignacion.estado === 1 ? 'Activo' : 'Inactivo',
            descripcion: asignacion.descripcion,
            fechaAsignacion: asignacion.fechaAsignacion,
            fechaModificacion: asignacion.fechaModificacion,
            propietario: {
                id: asignacion.userId,
                username: userData?.username ?? null,
                nombreCompleto: this.obtenerNombrePropietario(userData),
                email: userData?.persona?.email ?? userData?.email ?? null,
                cedula: userData?.persona?.dni ?? userData?.dni ?? null,
            },
            vehiculo: {
                id: asignacion.vehicleId,
                placa: vehiculoData?.placa ?? null,
                marca: vehiculoData?.marca ?? null,
                modelo: vehiculoData?.modelo ?? null,
                tipo: vehiculoData?.tipo ?? null,
                categoria: vehiculoData?.categoria ?? null,
            },
        };
    }
    obtenerNombrePropietario(userData) {
        if (!userData)
            return 'No disponible';
        const persona = userData.persona ?? {};
        const nombreDesdeCampos = [persona.firstName, persona.middleName, persona.lastName]
            .filter(Boolean)
            .join(' ')
            .trim();
        return userData.nombreCompleto
            || persona.nombreCompleto
            || nombreDesdeCampos
            || userData.username
            || userData.nombre
            || 'No disponible';
    }
    obtenerEtiquetaVehiculo(vehicleId, vehiculoDetalle) {
        if (!vehiculoDetalle)
            return vehicleId;
        const marcaModelo = [vehiculoDetalle.marca, vehiculoDetalle.modelo]
            .filter(Boolean)
            .join(' ')
            .trim();
        if (vehiculoDetalle.placa && marcaModelo) {
            return `${marcaModelo} (${vehiculoDetalle.placa})`;
        }
        return vehiculoDetalle.placa ?? marcaModelo ?? vehicleId;
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