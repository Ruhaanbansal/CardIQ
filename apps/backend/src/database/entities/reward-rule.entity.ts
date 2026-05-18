import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CreditCardEntity } from './credit-card.entity';

@Entity('reward_rules')
export class RewardRuleEntity {
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

  @Column({ type: 'int', default: 100 })
  priority: number; // Lower number = higher priority

  @Column({ type: 'jsonb' })
  conditions: any; // The JSON DSL for conditions (merchants, categories, amount)

  @Column({ type: 'jsonb' })
  reward: any; // The JSON DSL for reward (type, rate, cap)

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
