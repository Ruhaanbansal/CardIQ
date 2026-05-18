import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { MerchantEntity } from './merchant.entity';

@Entity('merchant_detection_rules')
export class MerchantDetectionRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  merchantId: string;

  @ManyToOne(() => MerchantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant: MerchantEntity;

  @Column({ type: 'varchar', length: 255 })
  pattern: string; // Regex or wildcard pattern

  @Column({ type: 'varchar', length: 50, default: 'REGEX' })
  patternType: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  confidenceScore: number;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
