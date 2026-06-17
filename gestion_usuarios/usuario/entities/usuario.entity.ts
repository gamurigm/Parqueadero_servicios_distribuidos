import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Person } from '../../persona/entities/persona.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User {
    @PrimaryColumn('uuid') // Requirement: id = copy of person ID
    id: string;

    @Column({ unique: true, length: 15 })
    username: string;

    @Column()
    passwordHash: string;

    @Column({ default: true })
    active: boolean;

    @Column({ nullable: true })
    lastLogin: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => Person)
    @JoinColumn({ name: 'id' }) // Requirement: id = copy of person ID
    person: Person;

    @ManyToMany(() => Role, (role) => role.users)
    @JoinTable({
        name: 'users_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
    })
    roles: Role[];
}