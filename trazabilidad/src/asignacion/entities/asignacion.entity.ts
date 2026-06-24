import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

/**
 * Entidad de Asignación Vehículo-Propietario.
 * RF1: Clave compuesta OBLIGATORIA con user_id + vehicle_id.
 * Un vehículo solo puede estar asignado a un propietario activo a la vez.
 */
@Entity('asignaciones')
export class Asignacion {
    /**
     * Clave compuesta - parte 1: ID del propietario (viene del microservicio de Usuarios)
     */
    @PrimaryColumn({ type: 'uuid', name: 'user_id' })
    userId: string;

    /**
     * Clave compuesta - parte 2: ID del vehículo (viene del microservicio de Vehículos)
     */
    @PrimaryColumn({ type: 'uuid', name: 'vehicle_id' })
    vehicleId: string;

    /**
     * Estado de la asignación: 1 = activo, 0 = inactivo
     * Regla de negocio: solo puede haber UNA asignación activa por vehicleId
     */
    @Column({ type: 'int', default: 1 })
    estado: number;

    /**
     * Notas o descripción de la asignación (opcional)
     */
    @Column({ type: 'text', nullable: true })
    notas: string;

    @CreateDateColumn({ name: 'fecha_asignacion', type: 'timestamptz' })
    fechaAsignacion: Date;

    @UpdateDateColumn({ name: 'fecha_modificacion', type: 'timestamptz' })
    fechaModificacion: Date;
}
