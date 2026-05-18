import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';
import { UserRole } from '@cardiq/shared-types';
import { UserCardEntity } from './user-card.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  passwordHash?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  authProvider?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authProviderId?: string;

  @Index()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastPasswordChange?: Date;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  accountLockedUntil?: Date;

  @OneToMany(() => UserCardEntity, (userCard) => userCard.user)
  cards: UserCardEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Index()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
