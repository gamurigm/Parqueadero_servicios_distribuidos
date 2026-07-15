import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('active_tokens')
export class ActiveToken {
  @PrimaryColumn()
  jti!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress!: string;

  @Column('timestamp', { name: 'expires_at' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
