import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CreditCardEntity } from './credit-card.entity';

@Entity('reward_exclusions')
export class RewardExclusionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid', { nullable: true })
  cardId?: string; // If null, applies globally to all cards

  @ManyToOne(() => CreditCardEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'card_id' })
  card?: CreditCardEntity;

  @Column({ type: 'varchar', length: 50 })
  category: string; // e.g., 'wallet_load', 'rent', 'fuel'

  @Column({ type: 'varchar', array: true, nullable: true })
  specificMccs?: string[];

  @Column({ type: 'varchar', array: true, nullable: true })
  specificMerchants?: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
