import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

/**
 * Enum de tipos de acción para la trazabilidad.
 * RF2: Registra cada operación realizada en cualquier microservicio.
 */
export enum TipoAccion {
    CREACION = 'CREACION',
    MODIFICACION = 'MODIFICACION',
    ELIMINACION = 'ELIMINACION',
    CONSULTA = 'CONSULTA',
    LOGIN = 'LOGIN',
    ACTIVACION = 'ACTIVACION',
    DESACTIVACION = 'DESACTIVACION',
    EMISION = 'EMISION',
    PAGO = 'PAGO',
    ANULACION = 'ANULACION',
}

/**
 * Enum de microservicios del sistema de parqueadero.
 * Identifica el origen de cada evento de trazabilidad.
 */
export enum Microservicio {
    TRAZABILIDAD = 'TRAZABILIDAD',
    USUARIOS = 'USUARIOS',
    VEHICULOS = 'VEHICULOS',
    ZONAS = 'ZONAS',
    TICKETS = 'TICKETS',
}

/**
 * Entidad de Evento de Trazabilidad (Auditoría).
 * RF2: Se genera automáticamente en cada operación sobre cualquier microservicio.
 * Entidad genérica que soporta trazabilidad de todos los endpoints del sistema.
 */
@Entity('eventos_trazabilidad')
export class EventoTrazabilidad {
    /**
     * ID único del evento de auditoría
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Microservicio de origen del evento
     */
    @Column({
        type: 'enum',
        enum: Microservicio,
        name: 'microservicio',
        default: Microservicio.TRAZABILIDAD,
    })
    microservicio: Microservicio;

    /**
     * Endpoint que generó el evento (e.g. "POST /vehiculos", "PUT /usuario/:id")
     */
    @Column({ type: 'varchar', name: 'endpoint', length: 255, default: '' })
    endpoint: string;

    /**
     * Método HTTP utilizado (GET, POST, PUT, DELETE, PATCH)
     */
    @Column({ type: 'varchar', name: 'metodo_http', length: 10, default: '' })
    metodoHttp: string;

    /**
     * ID de la entidad afectada (UUID o referencia) - nullable para eventos sin entidad
     */
    @Column({ type: 'varchar', name: 'entidad_id', nullable: true })
    entidadId: string;

    /**
     * Descripción legible del evento (e.g. "Se creó vehículo Toyota Corolla placa ABC-123")
     */
    @Column({ type: 'text', name: 'descripcion', default: '' })
    descripcion: string;

    /**
     * ID del usuario que ejecutó la acción (viene del JWT)
     */
    @Column({ type: 'varchar', name: 'usuario_ejecutor', nullable: true })
    usuarioEjecutor: string;

    /**
     * Nombre legible del usuario que ejecutó la acción
     */
    @Column({ type: 'varchar', name: 'usuario_ejecutor_nombre', nullable: true, length: 255 })
    usuarioEjecutorNombre: string;

    /**
     * Clave compuesta afectada - parte 1: ID del propietario
     * (nullable para retrocompatibilidad y eventos de otros microservicios)
     */
    @Column({ type: 'uuid', name: 'user_id', nullable: true })
    userId: string;

    /**
     * Clave compuesta afectada - parte 2: ID del vehículo
     * (nullable para retrocompatibilidad y eventos de otros microservicios)
     */
    @Column({ type: 'uuid', name: 'vehicle_id', nullable: true })
    vehicleId: string;

    /**
     * Tipo de acción realizada
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
