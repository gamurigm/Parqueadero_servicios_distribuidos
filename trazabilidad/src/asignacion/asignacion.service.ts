import {
    ConflictException,
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asignacion } from './entities/asignacion.entity';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { FactoryAsignacion } from './factory/factory-asignacion';
import { TrazabilidadService } from '../trazabilidad/trazabilidad.service';
import { TipoAccion } from '../trazabilidad/entities/trazabilidad.entity';
import { VehiculosClientService, VehiculoDetalle } from '../vehiculos-client/vehiculos-client.service';
import { UsuariosClientService } from '../usuarios-client/usuarios-client.service';
import { Utils } from '../utils/utils';

@Injectable()
export class AsignacionService {
    private utils: Utils;

    constructor(
        @InjectRepository(Asignacion)
        private readonly asignacionRepo: Repository<Asignacion>,
        private readonly trazabilidadService: TrazabilidadService,
        private readonly vehiculosClientService: VehiculosClientService,
        private readonly usuariosClientService: UsuariosClientService,
    ) {
        this.utils = new Utils();
    }

    async crear(dto: CreateAsignacionDto, authHeader?: string): Promise<any> {
        const userId = this.utils.validateUUID(dto.userId);
        const vehicleId = this.utils.validateUUID(dto.vehicleId);

        const propietario = await this.usuariosClientService.validarPropietario(userId, authHeader);

        const vehiculoDetalle = await this.vehiculosClientService.getVehiculo(vehicleId, authHeader);
        if (!vehiculoDetalle) {
            throw new NotFoundException(`El vehiculo con ID ${vehicleId} no existe en el sistema`);
        }

        const asignacionExistente = await this.asignacionRepo.findOne({
            where: { userId, vehicleId },
        });

        if (asignacionExistente) {
            throw new ConflictException(
                `Ya existe una asignacion para el usuario ${userId} con el vehiculo ${vehicleId}`,
            );
        }

        const vehiculoActivo = await this.asignacionRepo.findOne({
            where: { vehicleId, estado: 1 },
        });

        if (vehiculoActivo) {
            throw new ConflictException(
                `El vehiculo ${vehicleId} ya esta asignado activamente al propietario ${vehiculoActivo.userId}`,
            );
        }

        if (dto.descripcion) {
            dto.descripcion = this.utils.sanitizeText(dto.descripcion);
        }

        const asignacion = FactoryAsignacion.crear({ ...dto, userId, vehicleId });
        const saved = await this.asignacionRepo.save(asignacion);

        const propietarioNombre = this.obtenerNombrePropietario(propietario);
        const vehiculoInfo = this.obtenerEtiquetaVehiculo(vehicleId, vehiculoDetalle);
        await this.trazabilidadService.registrar(
            TipoAccion.CREACION,
            saved.userId,
            saved.vehicleId,
            `Se creo asignacion del vehiculo ${vehiculoInfo} al propietario ${propietarioNombre}`,
            null,
            TrazabilidadService.serializarAsignacion(saved),
        );

        return this.enriquecerAsignacion(saved, authHeader, propietario, vehiculoDetalle);
    }

    async listar(authHeader?: string): Promise<any[]> {
        const asignaciones = await this.asignacionRepo.find({
            order: { fechaAsignacion: 'DESC' },
        });

        return Promise.all(
            asignaciones.map((asignacion) => this.enriquecerAsignacion(asignacion, authHeader)),
        );
    }

    async buscarPorClave(userId: string, vehicleId: string, authHeader?: string): Promise<any> {
        const uid = this.utils.validateUUID(userId);
        const vid = this.utils.validateUUID(vehicleId);

        const asignacion = await this.asignacionRepo.findOne({
            where: { userId: uid, vehicleId: vid },
        });

        if (!asignacion) {
            throw new NotFoundException(
                `No se encontro asignacion para usuario ${uid} y vehiculo ${vid}`,
            );
        }

        return this.enriquecerAsignacion(asignacion, authHeader);
    }

    async actualizar(userId: string, vehicleId: string, dto: UpdateAsignacionDto, authHeader?: string): Promise<any> {
        const uid = this.utils.validateUUID(userId);
        const vid = this.utils.validateUUID(vehicleId);

        const asignacion = await this.asignacionRepo.findOne({
            where: { userId: uid, vehicleId: vid },
        });

        if (!asignacion) {
            throw new NotFoundException(
                `No se encontro asignacion para usuario ${uid} y vehiculo ${vid}`,
            );
        }

        const sinCambios =
            (dto.estado === undefined || dto.estado === asignacion.estado) &&
            (dto.descripcion === undefined || dto.descripcion === asignacion.descripcion);

        if (sinCambios) {
            throw new BadRequestException('No se detectaron cambios en los valores enviados');
        }

        if (dto.estado === 1 && asignacion.estado === 0) {
            const otroActivo = await this.asignacionRepo.findOne({
                where: { vehicleId: vid, estado: 1 },
            });
            if (otroActivo && otroActivo.userId !== uid) {
                throw new ConflictException(
                    `El vehiculo ya esta activo para otro propietario: ${otroActivo.userId}`,
                );
            }
        }

        const payloadAnterior = TrazabilidadService.serializarAsignacion(asignacion);

        if (dto.estado !== undefined) asignacion.estado = dto.estado;
        if (dto.descripcion !== undefined) asignacion.descripcion = this.utils.sanitizeText(dto.descripcion);

        const saved = await this.asignacionRepo.save(asignacion);

        const propietario = await this.usuariosClientService.obtenerUsuario(saved.userId, authHeader);
        const vehiculoDetalle = await this.vehiculosClientService.getVehiculo(saved.vehicleId, authHeader);
        const propietarioNombre = this.obtenerNombrePropietario(propietario);
        const vehiculoInfo = this.obtenerEtiquetaVehiculo(saved.vehicleId, vehiculoDetalle);
        const cambios: string[] = [];
        if (dto.estado !== undefined) cambios.push(`estado: ${dto.estado === 1 ? 'Activo' : 'Inactivo'}`);
        if (dto.descripcion !== undefined) cambios.push('descripcion actualizada');
        await this.trazabilidadService.registrar(
            TipoAccion.MODIFICACION,
            saved.userId,
            saved.vehicleId,
            `Se modifico asignacion de ${propietarioNombre} sobre ${vehiculoInfo} - Cambios: ${cambios.join(', ')}`,
            payloadAnterior,
            TrazabilidadService.serializarAsignacion(saved),
        );

        return this.enriquecerAsignacion(saved, authHeader, propietario, vehiculoDetalle);
    }

    async eliminar(userId: string, vehicleId: string, authHeader?: string): Promise<{ message: string }> {
        const uid = this.utils.validateUUID(userId);
        const vid = this.utils.validateUUID(vehicleId);

        const asignacion = await this.asignacionRepo.findOne({
            where: { userId: uid, vehicleId: vid },
        });

        if (!asignacion) {
            throw new NotFoundException(
                `No se encontro asignacion para usuario ${uid} y vehiculo ${vid}`,
            );
        }

        const payloadAnterior = TrazabilidadService.serializarAsignacion(asignacion);
        const propietario = await this.usuariosClientService.obtenerUsuario(asignacion.userId, authHeader);
        const vehiculoDetalle = await this.vehiculosClientService.getVehiculo(asignacion.vehicleId, authHeader);
        const propietarioNombre = this.obtenerNombrePropietario(propietario);
        const vehiculoInfo = this.obtenerEtiquetaVehiculo(asignacion.vehicleId, vehiculoDetalle);

        await this.asignacionRepo.remove(asignacion);

        await this.trazabilidadService.registrar(
            TipoAccion.ELIMINACION,
            uid,
            vid,
            `Se elimino asignacion de ${propietarioNombre} sobre ${vehiculoInfo}`,
            payloadAnterior,
            null,
        );

        return { message: `Asignacion de ${propietarioNombre} sobre ${vehiculoInfo} eliminada exitosamente` };
    }

    async obtenerFlotaPorPropietario(userId: string, authHeader?: string): Promise<any[]> {
        const uid = this.utils.validateUUID(userId);

        const asignaciones = await this.asignacionRepo.find({
            where: { userId: uid, estado: 1 },
            order: { fechaAsignacion: 'DESC' },
        });

        if (asignaciones.length === 0) {
            return [];
        }

        const flota = await Promise.all(
            asignaciones.map(async (asignacion) => {
                const vehiculoDetalle = await this.vehiculosClientService.getVehiculo(
                    asignacion.vehicleId,
                    authHeader,
                );

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
            }),
        );

        return flota;
    }

    private async enriquecerAsignacion(
        asignacion: Asignacion,
        authHeader?: string,
        propietario?: any | null,
        vehiculoDetalle?: VehiculoDetalle | null,
    ): Promise<any> {
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

    private obtenerNombrePropietario(userData: any | null | undefined): string {
        if (!userData) return 'No disponible';

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

    private obtenerEtiquetaVehiculo(vehicleId: string, vehiculoDetalle?: VehiculoDetalle | null): string {
        if (!vehiculoDetalle) return vehicleId;

        const marcaModelo = [vehiculoDetalle.marca, vehiculoDetalle.modelo]
            .filter(Boolean)
            .join(' ')
            .trim();

        if (vehiculoDetalle.placa && marcaModelo) {
            return `${marcaModelo} (${vehiculoDetalle.placa})`;
        }

        return vehiculoDetalle.placa ?? marcaModelo ?? vehicleId;
    }
}