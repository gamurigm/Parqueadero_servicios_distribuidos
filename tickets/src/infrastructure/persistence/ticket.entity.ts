import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TicketEstado {
  ACTIVO = 'ACTIVO',
  PAGADO = 'PAGADO',
  ANULADO = 'ANULADO',
}

@Entity('tickets')
@Index(['idEspacio', 'estado'], { unique: true, where: "estado = 'ACTIVO'" })
@Index(['placa', 'estado'], { unique: true, where: "estado = 'ACTIVO'" })
export class TicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'codigo_ticket', length: 16, unique: true })
  codigoTicket: string;

  @Column({ name: 'id_espacio', length: 50 })
  idEspacio: string;

  @Column({ length: 20, nullable: true })
  cedula?: string;

  @Column({ length: 20 })
  placa: string;

  @Column({
    type: 'enum',
    enum: TicketEstado,
    default: TicketEstado.ACTIVO,
  })
  estado: TicketEstado;

  @Column({ name: 'fecha_ingreso', type: 'timestamptz' })
  fechaIngreso: Date;

  @Column({ name: 'fecha_salida', type: 'timestamptz', nullable: true })
  fechaSalida?: Date;

  @Column({ name: 'id_empleado', length: 50 })
  idEmpleado: string;

  @Column({ name: 'id_empleado_pago', length: 50, nullable: true })
  idEmpleadoPago?: string;

  @Column({ name: 'id_empleado_anula', length: 50, nullable: true })
  idEmpleadoAnula?: string;

  @Column({ name: 'valor_recaudado', type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorRecaudado?: number;

  @Column({ name: 'motivo_anulacion', length: 500, nullable: true })
  motivoAnulacion?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
