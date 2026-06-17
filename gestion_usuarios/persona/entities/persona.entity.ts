import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { User } from '../../usuario/entities/usuario.entity';

@Entity('personas')
export class Person {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 30 })
    firstName: string;

    @Column({ length: 30, nullable: true })
    middleName: string;

    @Column({ length: 30 })
    lastName: string;

    @Column({ length: 30, unique: true })
    dni: string;

    @Column({ length: 50 })
    email: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => User, user => user.person)
    user: User;
}
