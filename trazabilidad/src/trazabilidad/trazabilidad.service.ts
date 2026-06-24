import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventoTrazabilidad, TipoAccion } from './entities/trazabilidad.entity';
import { Asignacion } from '../asignacion/entities/asignacion.entity';

/**
 * Servicio de Trazabilidad (Auditoría).
 * RF2: Registra automáticamente cada evento sobre asignaciones.
 * SOLID - Single Responsibility Principle (SRP):
 * Este servicio SOLO se encarga del registro de auditoría.
 */
@Injectable()
export class TrazabilidadService {
    constructor(
        @InjectRepository(EventoTrazabilidad)
        private readonly trazabilidadRepo: Repository<EventoTrazabilidad>,
    ) {}

    /**
     * Registra un nuevo evento de auditoría.
     * Llamado internamente desde AsignacionService en cada operación CRUD.
     *
     * @param tipo - Tipo de acción: CREACION | MODIFICACION | ELIMINACION
     * @param userId - ID del propietario afectado
     * @param vehicleId - ID del vehículo afectado
     * @param payloadAnterior - Estado antes del cambio (null en CREACION)
     * @param payloadNuevo - Estado después del cambio (null en ELIMINACION)
     */
    async registrar(
        tipo: TipoAccion,
        userId: string,
        vehicleId: string,
        payloadAnterior: Record<string, any> | null,
        payloadNuevo: Record<string, any> | null,
    ): Promise<EventoTrazabilidad> {
        const evento = this.trazabilidadRepo.create({
            userId,
            vehicleId,
            tipoAccion: tipo,
            payloadAnterior,
            payloadNuevo,
        });
        return await this.trazabilidadRepo.save(evento);
    }

    /**
     * Obtiene el historial de auditoría completo de una asignación específica.
     */
    async listarPorAsignacion(userId: string, vehicleId: string): Promise<EventoTrazabilidad[]> {
        return await this.trazabilidadRepo.find({
            where: { userId, vehicleId },
            order: { timestamp: 'DESC' },
        });
    }

    /**
     * Obtiene todo el historial de auditoría de un propietario.
     */
    async listarPorPropietario(userId: string): Promise<EventoTrazabilidad[]> {
        return await this.trazabilidadRepo.find({
            where: { userId },
            order: { timestamp: 'DESC' },
        });
    }

    /**
     * Obtiene todos los eventos de trazabilidad (paginado).
     */
    async listarTodos(): Promise<EventoTrazabilidad[]> {
        return await this.trazabilidadRepo.find({
            order: { timestamp: 'DESC' },
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
