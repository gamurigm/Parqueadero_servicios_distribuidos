import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../usuario/entities/usuario.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  token!: string;

  @Column({ name: 'usuario_id' })
  usuarioId!: string;

  @Column('timestamp')
  expiresAt!: Date;

  @Column({ default: false })
  revoked!: boolean;

  @Column('simple-array', { nullable: true })
  roles!: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.rolesUsuarios) // wait, relation is user -> refreshTokens
  @JoinColumn({ name: 'usuario_id' })
  usuario!: User;
}
