import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('unknown_merchants')
export class UnknownMerchantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'text' })
  rawNarration: string;

  @Column({ type: 'text', nullable: true })
  normalizedNarration?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  mccCode?: string;

  @Column({ type: 'int', default: 1 })
  occurrenceCount: number;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string; // PENDING, REVIEWED, MAPPED, IGNORED

  @Column({ type: 'jsonb', nullable: true })
  aiSuggestedCategory?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
