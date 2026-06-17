import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../usuario/entities/usuario.entity';

@Entity('persons')
export class Person {
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

    @CreateDateColumn({ type: 'timestamp',name: 'created_at',default: () => 'CURRENT_TIMESTAMP'})
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp',name: 'updated_at',default: () => 'CURRENT_TIMESTAMP'})
    updatedAt!: Date;

    @OneToOne(() => User, user => user.person)
    user!: User;
}
