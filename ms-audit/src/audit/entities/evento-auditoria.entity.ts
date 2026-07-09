import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'evento_auditoria' })
export class EventoAuditoria {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 20 })
    servicio: string;

    @Column({ type: 'varchar', length: 255 })
    accion: string;

    @Column({ type: "varchar", length: 20 })
    entidad!: string;

    @Column({ type: 'jsonb', nullable: true })
    datos!: any;

    @Column({ type: 'varchar', length: 32, nullable: false })
    username!: string;

    @Column({ type: 'varchar', length: 15, nullable: true })
    rol!: string;

    @Column({ type: 'varchar', length: 15, nullable: true })
    ip1: string //publica 192.168.2.152

    @Column({ type: 'varchar', length: 50, nullable: true })
    mac!: string

    @CreateDateColumn('timestamp')
    timestamp!: Date;


}
