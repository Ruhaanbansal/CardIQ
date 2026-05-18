import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('merchant_resolution_logs')
export class MerchantResolutionLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  rawNarration: string;

  @Column({ type: 'text', nullable: true })
  normalizedNarration?: string;

  @Index()
  @Column('uuid', { nullable: true })
  resolvedMerchantId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  resolutionMethod?: string; // EXACT, ALIAS, TRIGRAM, LEVENSHTEIN, AI, MCC

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceScore?: number;

  @Column({ type: 'boolean', default: false })
  isAiFallback: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
