import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { FeatureFlagEnvironment } from '@cardiq/shared-types';

@Entity('feature_flags')
export class FeatureFlagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  key: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  enabled: boolean;

  @Column({ type: 'enum', enum: FeatureFlagEnvironment, default: FeatureFlagEnvironment.ALL })
  environment: FeatureFlagEnvironment;

  @Column({ type: 'int', default: 100 })
  rolloutPercentage: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
