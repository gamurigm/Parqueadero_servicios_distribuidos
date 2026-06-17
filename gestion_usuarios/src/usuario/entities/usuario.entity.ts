import { ChildEntity, Column, ManyToMany, JoinTable } from 'typeorm';
import { Person } from '../../persona/entities/persona.entity';
import { Role } from '../../roles/entities/role.entity';

@ChildEntity('Usuario')
export class User extends Person {
    @Column({ unique: true, length: 15 })
    username: string;

    @Column()
    passwordHash: string;

    @Column({ nullable: true })
    lastLogin: Date;

    @ManyToMany(() => Role, (role) => role.users)
    @JoinTable({
        name: 'users_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
    })
    roles: Role[];
}
