<<<<<<< HEAD
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from '../../usuario/entities/usuario.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => User, (user) => user.roles)
    users: User[];
=======
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity('roles')
export class Roles {
    
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: 'boolean', default: true })
    activo!: boolean;

    @CreateDateColumn({ type: 'datetime',default: () => 'CURRENT_TIMESTAMP'})
    created_at!: Date;

    @UpdateDateColumn({ type: 'datetime',default: () => 'CURRENT_TIMESTAMP'})
    updated_at!: Date;

    @Column({ type: 'text' })
    descripcion!: string;

    @Column({ type: 'varchar', length: 50, unique: true})
    nombre!: string;
>>>>>>> 54702e9f86ee1b79af36032c69b6de79af6ac270
}
