@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
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
    @JoinColumn({
        name: 'person_id'
    })
    person: Person;

    @Column()
    personId: number;
}