import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity('roles')
export class Roles {
    
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: 'boolean', default: true })
    activo!: boolean;

    @CreateDateColumn({ type: 'timestamp',default: () => 'CURRENT_TIMESTAMP'})
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp',default: () => 'CURRENT_TIMESTAMP'})
    updated_at!: Date;

    @Column({ type: 'text' })
    descripcion!: string;

    @Column({ type: 'varchar', length: 50, unique: true})
    nombre!: string;
}
