import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index
} from 'typeorm';

@Entity('scraper_snapshots')
@Index(['bank', 'cardId', 'createdAt'])
@Index(['contentHash'])
export class ScraperSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  bank: string;

  @Column({ type: 'uuid', nullable: true })
  cardId?: string;

  @Column({ type: 'varchar', length: 50 })
  sourceType: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'text' })
  rawContent: string;

  @Column({ type: 'jsonb' })
  normalizedContent: object;

  @Column({ type: 'varchar', length: 64 })
  contentHash: string;

  @Column({ type: 'int', default: 0 })
  scrapeConfidence: number;

  @Column({ type: 'int', default: 0 })
  parserConfidence: number;

  @Column({ type: 'varchar', length: 30, default: 'unverified' })
  verificationStatus: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('scraper_jobs')
@Index(['bank', 'status'])
export class ScraperJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  bank: string;

  @Column({ type: 'uuid', nullable: true })
  cardId?: string;

  @Column({ type: 'varchar', length: 50 })
  sourceType: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'int', default: 5 })
  priority: number;

  @Column({ type: 'text', nullable: true })
  lastError?: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  scheduledAt: Date;
}

@Entity('benefit_changes')
@Index(['bank', 'cardId', 'detectedAt'])
export class BenefitChangeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  bank: string;

  @Column({ type: 'uuid', nullable: true })
  cardId?: string;

  @Column({ type: 'uuid' })
  previousSnapshotId: string;

  @Column({ type: 'uuid' })
  currentSnapshotId: string;

  @Column({ type: 'jsonb' })
  changes: object[];

  @Column({ type: 'varchar', length: 20, default: 'low' })
  overallSeverity: string;

  @Column({ type: 'boolean', default: false })
  requiresReview: boolean;

  @Column({ type: 'boolean', default: false })
  isReviewed: boolean;

  @CreateDateColumn()
  detectedAt: Date;
}
