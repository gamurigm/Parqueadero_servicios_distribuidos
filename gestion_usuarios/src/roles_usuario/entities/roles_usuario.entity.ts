import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../usuario/entities/usuario.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('roles_usuario')
export class RolesUsuarios {
    @PrimaryColumn('uuid')
    id_rol: string;

    @PrimaryColumn('uuid')
    id_usuario: string;

    @Column({ type: 'boolean', default: true })
    activo: boolean;

    @CreateDateColumn({ name: 'assigned_at' })
    assignedAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario' })
    user: User;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'id_rol' })
    role: Role;
}