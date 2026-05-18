import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity('admin_audit_logs')
@Index(['adminId', 'timestamp'])
@Index(['action', 'timestamp'])
export class AdminAuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  adminId: string;

  @Column({ type: 'varchar', length: 255 })
  adminEmail: string;

  @Column({ type: 'varchar', length: 50 })
  adminRole: string;

  @Column({ type: 'varchar', length: 80 })
  action: string;

  @Column({ type: 'varchar', length: 80 })
  entityType: string;

  @Column({ type: 'uuid', nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true })
  previousValue?: object;

  @Column({ type: 'jsonb', nullable: true })
  newValue?: object;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sessionId?: string;

  @CreateDateColumn()
  timestamp: Date;
}

@Entity('feature_flags')
@Index(['key', 'environment'], { unique: true })
export class FeatureFlagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  key: string;

  @Column({ type: 'varchar', length: 200 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'int', default: 100 })
  rolloutPercentage: number;

  @Column({ type: 'varchar', length: 30, default: 'production' })
  environment: string;

  @Column({ type: 'boolean', default: false })
  isKillSwitch: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'varchar', length: 255 })
  createdBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
