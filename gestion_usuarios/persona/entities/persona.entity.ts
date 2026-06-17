<<<<<<< HEAD
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { User } from '../../usuario/entities/usuario.entity';

@Entity('personas')
export class Person {
    @PrimaryGeneratedColumn('uuid')
    id: string;
=======
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../usuario/entities/usuario.entity';

@Entity('persons')
export class Person {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
>>>>>>> 54702e9f86ee1b79af36032c69b6de79af6ac270

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

    @OneToOne(() => User, user => user.person)
<<<<<<< HEAD
    user!: User;
}
=======
    user: User;
}
>>>>>>> 0d2fad668cf260401eff1d05e5a5ca756ad11ec6
