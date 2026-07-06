import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventoTrazabilidad, Microservicio, TipoAccion } from './entities/trazabilidad.entity';
import { Asignacion } from '../asignacion/entities/asignacion.entity';
import { RegistrarEventoDto } from './dto/registrar-evento.dto';
import { VehiculosClientService } from '../vehiculos-client/vehiculos-client.service';
import { UsuariosClientService } from '../usuarios-client/usuarios-client.service';

/**
 * Servicio de Trazabilidad (Auditoría).
 * RF2: Registra automáticamente cada evento sobre cualquier microservicio.
 * SOLID - Single Responsibility Principle (SRP):
 * Este servicio SOLO se encarga del registro de auditoría y enriquecimiento de datos.
 */
@Injectable()
export class TrazabilidadService {
    private readonly logger = new Logger(TrazabilidadService.name);

    constructor(
        @InjectRepository(EventoTrazabilidad)
        private readonly trazabilidadRepo: Repository<EventoTrazabilidad>,
        private readonly vehiculosClientService: VehiculosClientService,
        private readonly usuariosClientService: UsuariosClientService,
    ) {}

    /**
     * Registra un evento de trazabilidad genérico desde cualquier microservicio.
     * Usado por el endpoint POST /trazabilidad/registrar y por el servicio interno.
     */
    async registrarEvento(dto: RegistrarEventoDto): Promise<EventoTrazabilidad> {
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
        this.logger.log(
            `[${dto.microservicio}] ${dto.metodoHttp} ${dto.endpoint} - ${dto.tipoAccion}: ${dto.descripcion}`,
        );
        return saved;
    }

    /**
     * Registra un evento de auditoría para asignaciones (retrocompatible).
     * Llamado internamente desde AsignacionService en cada operación CRUD.
     *
     * @param tipo - Tipo de acción: CREACION | MODIFICACION | ELIMINACION
     * @param userId - ID del propietario afectado
     * @param vehicleId - ID del vehículo afectado
     * @param descripcion - Descripción legible del evento
     * @param payloadAnterior - Estado antes del cambio (null en CREACION)
     * @param payloadNuevo - Estado después del cambio (null en ELIMINACION)
     */
    async registrar(
        tipo: TipoAccion,
        userId: string,
        vehicleId: string,
        descripcion: string,
        payloadAnterior: Record<string, any> | null,
        payloadNuevo: Record<string, any> | null,
    ): Promise<EventoTrazabilidad> {
        return this.registrarEvento({
            microservicio: Microservicio.TRAZABILIDAD,
            endpoint: tipo === TipoAccion.CREACION
                ? 'POST /asignaciones'
                : tipo === TipoAccion.MODIFICACION
                    ? 'PUT /asignaciones'
                    : 'DELETE /asignaciones',
            metodoHttp: tipo === TipoAccion.CREACION
                ? 'POST'
                : tipo === TipoAccion.MODIFICACION
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

    /**
     * Obtiene el historial de auditoría completo de una asignación específica.
     * Enriquece los datos con información amigable.
     */
    async listarPorAsignacion(userId: string, vehicleId: string, authHeader?: string): Promise<any[]> {
        const eventos = await this.trazabilidadRepo.find({
            where: { userId, vehicleId },
            order: { timestamp: 'DESC' },
        });
        return this.enriquecerEventos(eventos, authHeader);
    }

    /**
     * Obtiene todo el historial de auditoría de un propietario.
     * Enriquece los datos con información amigable.
     */
    async listarPorPropietario(userId: string, authHeader?: string): Promise<any[]> {
        const eventos = await this.trazabilidadRepo.find({
            where: { userId },
            order: { timestamp: 'DESC' },
        });
        return this.enriquecerEventos(eventos, authHeader);
    }

    /**
     * Obtiene todos los eventos de trazabilidad (enriquecidos).
     */
    async listarTodos(authHeader?: string): Promise<any[]> {
        const eventos = await this.trazabilidadRepo.find({
            order: { timestamp: 'DESC' },
        });
        return this.enriquecerEventos(eventos, authHeader);
    }

    /**
     * Obtiene eventos de trazabilidad filtrados por microservicio.
     */
    async listarPorMicroservicio(microservicio: Microservicio, authHeader?: string): Promise<any[]> {
        const eventos = await this.trazabilidadRepo.find({
            where: { microservicio },
            order: { timestamp: 'DESC' },
        });
        return this.enriquecerEventos(eventos, authHeader);
    }

    /**
     * Enriquece los eventos de trazabilidad con datos legibles.
     * Consulta los microservicios de Usuarios y Vehículos para obtener
     * nombres, placas, marcas, etc. en lugar de solo mostrar UUIDs.
     */
    private async enriquecerEventos(eventos: EventoTrazabilidad[], authHeader?: string): Promise<any[]> {
        // Recopilar todos los userIds y vehicleIds únicos
        const userIds = [...new Set(eventos.map(e => e.userId).filter(Boolean))];
        const vehicleIds = [...new Set(eventos.map(e => e.vehicleId).filter(Boolean))];

        // Consultar datos de usuarios y vehículos en paralelo (con cache en memoria)
        const usersMap = new Map<string, any>();
        const vehiclesMap = new Map<string, any>();

        await Promise.all([
            // Obtener datos de usuarios
            ...userIds.map(async (uid) => {
                try {
                    const userData = await this.usuariosClientService.obtenerUsuario(uid, authHeader);
                    if (userData) usersMap.set(uid, userData);
                } catch (error) {
                    this.logger.warn(`No se pudo obtener datos del usuario ${uid}: ${error.message}`);
                }
            }),
            // Obtener datos de vehículos
            ...vehicleIds.map(async (vid) => {
                try {
                    const vehiculoData = await this.vehiculosClientService.getVehiculo(vid, authHeader);
                    if (vehiculoData) vehiclesMap.set(vid, vehiculoData);
                } catch (error) {
                    this.logger.warn(`No se pudo obtener datos del vehículo ${vid}: ${error.message}`);
                }
            }),
        ]);

        // Enriquecer cada evento
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
                // Datos enriquecidos del propietario
                propietario: evento.userId
                    ? {
                        id: evento.userId,
                        username: userData?.username ?? 'No disponible',
                        nombre: userData?.nombre ?? userData?.username ?? 'No disponible',
                    }
                    : null,
                // Datos enriquecidos del vehículo
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

    /**
     * Serializa una asignación a un objeto plano para guardar en el payload JSON.
     */
    static serializarAsignacion(asignacion: Asignacion): Record<string, any> {
        return {
            userId: asignacion.userId,
            vehicleId: asignacion.vehicleId,
            estado: asignacion.estado,
            descripcion: asignacion.descripcion,
            fechaAsignacion: asignacion.fechaAsignacion,
            fechaModificacion: asignacion.fechaModificacion,
        };
    }
}

