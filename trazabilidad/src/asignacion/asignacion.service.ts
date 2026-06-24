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
import { VehiculosClientService } from '../vehiculos-client/vehiculos-client.service';
import { Utils } from '../utils/utils';

/**
 * Servicio de Asignaciones Vehículo-Propietario.
 * SOLID:
 * - SRP: Solo gestiona la lógica de asignaciones
 * - OCP: Usa Factory para crear entidades (extensible sin modificar)
 * - DIP: Depende de TrazabilidadService e VehiculosClientService (abstracciones)
 */
@Injectable()
export class AsignacionService {
    private utils: Utils;

    constructor(
        @InjectRepository(Asignacion)
        private readonly asignacionRepo: Repository<Asignacion>,
        private readonly trazabilidadService: TrazabilidadService,
        private readonly vehiculosClientService: VehiculosClientService,
    ) {
        this.utils = new Utils();
    }

    /**
     * RF1: Crea una nueva asignación vehículo-propietario.
     * Reglas:
     * - La clave compuesta (userId + vehicleId) debe ser única
     * - Un vehículo solo puede tener UNA asignación activa a la vez
     * Trigger: Registra evento CREACION en trazabilidad.
     */
    async crear(dto: CreateAsignacionDto): Promise<Asignacion> {
        // 1. Validar UUIDs
        const userId = this.utils.validateUUID(dto.userId);
        const vehicleId = this.utils.validateUUID(dto.vehicleId);

        // 2. Verificar que no exista ya esta asignación exacta
        const asignacionExistente = await this.asignacionRepo.findOne({
            where: { userId, vehicleId },
        });

        if (asignacionExistente) {
            throw new ConflictException(
                `Ya existe una asignación para el usuario ${userId} con el vehículo ${vehicleId}`,
            );
        }

        // 3. RF1 - Verificar que el vehículo no esté activo con otro propietario
        const vehiculoActivo = await this.asignacionRepo.findOne({
            where: { vehicleId, estado: 1 },
        });

        if (vehiculoActivo) {
            throw new ConflictException(
                `El vehículo ${vehicleId} ya está asignado activamente al propietario ${vehiculoActivo.userId}`,
            );
        }

        // 4. Crear entidad usando Factory (OCP)
        const asignacion = FactoryAsignacion.crear({ ...dto, userId, vehicleId });
        const saved = await this.asignacionRepo.save(asignacion);

        // 5. RF2: Registrar evento de trazabilidad CREACION (automático)
        await this.trazabilidadService.registrar(
            TipoAccion.CREACION,
            saved.userId,
            saved.vehicleId,
            null,
            TrazabilidadService.serializarAsignacion(saved),
        );

        return saved;
    }

    /**
     * Lista todas las asignaciones.
     */
    async listar(): Promise<Asignacion[]> {
        return await this.asignacionRepo.find({
            order: { fechaAsignacion: 'DESC' },
        });
    }

    /**
     * Busca una asignación por su clave compuesta.
     */
    async buscarPorClave(userId: string, vehicleId: string): Promise<Asignacion> {
        const uid = this.utils.validateUUID(userId);
        const vid = this.utils.validateUUID(vehicleId);

        const asignacion = await this.asignacionRepo.findOne({
            where: { userId: uid, vehicleId: vid },
        });

        if (!asignacion) {
            throw new NotFoundException(
                `No se encontró asignación para usuario ${uid} y vehículo ${vid}`,
            );
        }

        return asignacion;
    }

    /**
     * Actualiza una asignación existente (estado y/o notas).
     * Trigger: Registra evento MODIFICACION en trazabilidad.
     */
    async actualizar(userId: string, vehicleId: string, dto: UpdateAsignacionDto): Promise<Asignacion> {
        const uid = this.utils.validateUUID(userId);
        const vid = this.utils.validateUUID(vehicleId);

        // 1. Buscar la asignación existente
        const asignacion = await this.asignacionRepo.findOne({
            where: { userId: uid, vehicleId: vid },
        });

        if (!asignacion) {
            throw new NotFoundException(
                `No se encontró asignación para usuario ${uid} y vehículo ${vid}`,
            );
        }

        // 2. Verificar que haya cambios reales
        const sinCambios =
            (dto.estado === undefined || dto.estado === asignacion.estado) &&
            (dto.notas === undefined || dto.notas === asignacion.notas);

        if (sinCambios) {
            throw new BadRequestException('No se detectaron cambios en los valores enviados');
        }

        // 3. Si se activa el vehículo, verificar que no esté activo en otra asignación
        if (dto.estado === 1 && asignacion.estado === 0) {
            const otroActivo = await this.asignacionRepo.findOne({
                where: { vehicleId: vid, estado: 1 },
            });
            if (otroActivo && otroActivo.userId !== uid) {
                throw new ConflictException(
                    `El vehículo ya está activo para otro propietario: ${otroActivo.userId}`,
                );
            }
        }

        // 4. Guardar snapshot anterior para trazabilidad
        const payloadAnterior = TrazabilidadService.serializarAsignacion(asignacion);

        // 5. Aplicar cambios
        if (dto.estado !== undefined) asignacion.estado = dto.estado;
        if (dto.notas !== undefined) asignacion.notas = dto.notas;

        const saved = await this.asignacionRepo.save(asignacion);

        // 6. RF2: Registrar evento MODIFICACION (automático)
        await this.trazabilidadService.registrar(
            TipoAccion.MODIFICACION,
            saved.userId,
            saved.vehicleId,
            payloadAnterior,
            TrazabilidadService.serializarAsignacion(saved),
        );

        return saved;
    }

    /**
     * Elimina una asignación por su clave compuesta.
     * Trigger: Registra evento ELIMINACION en trazabilidad.
     */
    async eliminar(userId: string, vehicleId: string): Promise<{ message: string }> {
        const uid = this.utils.validateUUID(userId);
        const vid = this.utils.validateUUID(vehicleId);

        const asignacion = await this.asignacionRepo.findOne({
            where: { userId: uid, vehicleId: vid },
        });

        if (!asignacion) {
            throw new NotFoundException(
                `No se encontró asignación para usuario ${uid} y vehículo ${vid}`,
            );
        }

        // 1. Guardar snapshot antes de eliminar
        const payloadAnterior = TrazabilidadService.serializarAsignacion(asignacion);

        // 2. Eliminar
        await this.asignacionRepo.remove(asignacion);

        // 3. RF2: Registrar evento ELIMINACION (automático)
        await this.trazabilidadService.registrar(
            TipoAccion.ELIMINACION,
            uid,
            vid,
            payloadAnterior,
            null,
        );

        return { message: `Asignación usuario=${uid} / vehículo=${vid} eliminada exitosamente` };
    }

    /**
     * RF3: Obtiene la flota de vehículos de un propietario con detalles de tipo y categoría.
     * Comunica con el Microservicio de Vehículos para enriquecer la respuesta.
     */
    async obtenerFlotaPorPropietario(userId: string): Promise<any[]> {
        const uid = this.utils.validateUUID(userId);

        // 1. Obtener todas las asignaciones activas del propietario
        const asignaciones = await this.asignacionRepo.find({
            where: { userId: uid, estado: 1 },
            order: { fechaAsignacion: 'DESC' },
        });

        if (asignaciones.length === 0) {
            return [];
        }

        // 2. Para cada asignación, consultar los detalles del vehículo (RF3)
        const flota = await Promise.all(
            asignaciones.map(async (asignacion) => {
                const vehiculoDetalle = await this.vehiculosClientService.getVehiculo(
                    asignacion.vehicleId,
                );

                return {
                    // Datos de la asignación
                    userId: asignacion.userId,
                    vehicleId: asignacion.vehicleId,
                    estado: asignacion.estado,
                    notas: asignacion.notas,
                    fechaAsignacion: asignacion.fechaAsignacion,
                    // Detalles del vehículo (del microservicio externo)
                    vehiculo: vehiculoDetalle
                        ? {
                              id: vehiculoDetalle.id,
                              tipo: vehiculoDetalle.tipo,
                              categoria: vehiculoDetalle.categoria,
                              marca: vehiculoDetalle.marca ?? null,
                              modelo: vehiculoDetalle.modelo ?? null,
                              placa: vehiculoDetalle.placa ?? null,
                          }
                        : { id: asignacion.vehicleId, error: 'Servicio de vehículos no disponible' },
                };
            }),
        );

        return flota;
    }
}
