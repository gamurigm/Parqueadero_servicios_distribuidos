// src/user-roles/entities/user-role.entity.ts
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../usuario/entities/usuario.entity';
import { Roles } from '../../roles/entities/role.entity';

@Entity(' roles_usuario')
export class RolesUsuarios {
    @PrimaryColumn('uuid')
    id_rol!: string;

    @PrimaryColumn('uuid')
    id_usuario!: string;

    @Column({ type: 'boolean', default: true })
    activo!: boolean;

    @CreateDateColumn({ type: 'timestamp',default: () => 'CURRENT_TIMESTAMP'})
    assigned_at!: Date;

    @UpdateDateColumn({ type: 'timestamp',default: () => 'CURRENT_TIMESTAMP'})
    updated_at!: Date;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'id_user' })
    user!: User;

    @ManyToOne(() => Roles, (role) => role.id)
    @JoinColumn({ name: 'id_role' })
    role!: Roles;
}