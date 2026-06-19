import { Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Entity, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Person } from '../../persona/entities/persona.entity';
import { RolesUsuarios } from '../../roles_usuario/entities/roles_usuario.entity';

@Entity('usuarios')
export class User {
    @PrimaryColumn('uuid')
    id!: string; 

    @OneToOne(() => Person)
    @JoinColumn({ name: 'id' }) 
    persona!: Person;

    @Column({ unique: true, length: 15 })
    username!: string;

    @Column()
    passwordHash!: string;

    @Column({ nullable: true })
    lastLogin!: Date;

    @CreateDateColumn({ name: 'created_at', })
    createdAt!: Date;
    
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @Column({default:true})
    active!: boolean;

    @OneToMany(() => RolesUsuarios, (rolesUsuario) => rolesUsuario.user)
    rolesUsuarios!: RolesUsuarios[];
}