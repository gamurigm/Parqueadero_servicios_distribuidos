import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RolesUsuarios } from '../../roles_usuario/entities/roles_usuario.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'boolean', default: true })
    activo!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @Column({ type: 'text' })
    descripcion!: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    nombre!: string;

    @OneToMany(() => RolesUsuarios, (rolesUsuario) => rolesUsuario.role)
    rolesUsuarios!: RolesUsuarios[];
}