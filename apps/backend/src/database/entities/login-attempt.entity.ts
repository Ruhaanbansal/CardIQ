import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('login_attempts')
export class LoginAttemptEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ type: 'boolean' })
  isSuccess: boolean;

  @Column({ type: 'varchar', nullable: true })
  failureReason?: string;

  @Column({ type: 'varchar', nullable: true })
  userAgent?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
