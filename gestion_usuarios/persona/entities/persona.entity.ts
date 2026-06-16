import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('personas')
export class Person {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column({ length: 30 })
    firstName!: string;

    @Column({ length: 30, nullable: true })
    middleName!: string;

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

function Entity(arg0: string): (target: typeof Person, context: ClassDecoratorContext<typeof Person>) => void | typeof Person {
    throw new Error("Function not implemented.");
}


function PrimaryGeneratedColumn(): (target: undefined, context: ClassFieldDecoratorContext<Person, number> & { name: "id"; private: false; static: false; }) => void | ((this: Person, value: number) => number) {
    throw new Error("Function not implemented.");
}


function Column(arg0: { length: number; }): (target: undefined, context: ClassFieldDecoratorContext<Person, string> & { name: "firstName"; private: false; static: false; }) => void | ((this: Person, value: string) => string) {
    throw new Error("Function not implemented.");
}


function CreateDateColumn(): (target: undefined, context: ClassFieldDecoratorContext<Person, Date> & { name: "createdAt"; private: false; static: false; }) => void | ((this: Person, value: Date) => Date) {
    throw new Error("Function not implemented.");
}


function UpdateDateColumn(): (target: undefined, context: ClassFieldDecoratorContext<Person, Date> & { name: "updatedAt"; private: false; static: false; }) => void | ((this: Person, value: Date) => Date) {
    throw new Error("Function not implemented.");
}


function OneToOne(arg0: () => any, arg1: (user: any) => any): (target: undefined, context: ClassFieldDecoratorContext<Person, User> & { name: "user"; private: false; static: false; }) => void | ((this: Person, value: User) => User) {
    throw new Error("Function not implemented.");
}
