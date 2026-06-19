// persona.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, TableInheritance, OneToOne } from 'typeorm';
import { User } from '../../usuario/entities/usuario.entity';

@Entity('personas')
@TableInheritance({ column: { name: 'tipo', type: 'varchar', length: 50 } }) 
export abstract class Person {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ default: true })
    active!: boolean;

    @Column('text')
    address!: string;

    @Column({ length: 30, unique: true })
    dni!: string;

    @Column({ length: 50, unique: true })
    email!: string;

    @Column({ name: 'first_name', length: 30 })
    firstName!: string;

    @Column({ name: 'middle_name', length: 30, nullable: true })
    middleName?: string;

    @Column({ name: 'last_name', length: 30 })
    lastName!: string;

    @Column({ length: 30 })
    nationality!: string;

    @Column({ length: 15 })
    phone!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @OneToOne(() => User, (user) => user.persona)
    user?: User;

    abstract obtenerTipo(): string;
}