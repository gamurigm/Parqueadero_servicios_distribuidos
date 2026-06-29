import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

/**
 * Enum de tipos de acción para la trazabilidad.
 * RF2: Registra CREACION, MODIFICACION o ELIMINACION.
 */
export enum TipoAccion {
    CREACION = 'CREACION',
    MODIFICACION = 'MODIFICACION',
    ELIMINACION = 'ELIMINACION',
}

/**
 * Entidad de Evento de Trazabilidad (Auditoría).
 * RF2: Se genera automáticamente en cada operación sobre asignaciones.
 * Entidad separada de Asignacion (desacoplamiento).
 */
@Entity('eventos_trazabilidad')
export class EventoTrazabilidad {
    /**
     * ID único del evento de auditoría
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Clave compuesta afectada - parte 1: ID del propietario
     */
    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    /**
     * Clave compuesta afectada - parte 2: ID del vehículo
     */
    @Column({ type: 'uuid', name: 'vehicle_id' })
    vehicleId: string;

    /**
     * Tipo de acción realizada: CREACION | MODIFICACION | ELIMINACION
     */
    @Column({
        type: 'enum',
        enum: TipoAccion,
        name: 'tipo_accion',
    })
    tipoAccion: TipoAccion;

    /**
     * Timestamp exacto con zona horaria del evento
     */
    @CreateDateColumn({ name: 'timestamp', type: 'timestamptz' })
    timestamp: Date;

    /**
     * Estado/payload anterior al cambio (null en CREACION)
     */
    @Column({ type: 'jsonb', name: 'payload_anterior', nullable: true })
    payloadAnterior: Record<string, any> | null;

    /**
     * Estado/payload nuevo después del cambio (null en ELIMINACION)
     */
    @Column({ type: 'jsonb', name: 'payload_nuevo', nullable: true })
    payloadNuevo: Record<string, any> | null;
}
