import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CreditCardEntity } from './credit-card.entity';

@Entity('reward_milestones')
export class RewardMilestoneEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  cardId: string;

  @ManyToOne(() => CreditCardEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: CreditCardEntity;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'ANNUAL_FEE_WAIVER', 'BONUS_POINTS', 'VOUCHER'

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  targetAmount: number;

  @Column({ type: 'jsonb' })
  reward: any; // { type: 'points', value: 10000 } or { type: 'fee_waiver' }

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
