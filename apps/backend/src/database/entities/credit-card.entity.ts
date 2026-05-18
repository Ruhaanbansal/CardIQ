import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ICreditCard, CardNetwork, CardType, CardTier, RewardType } from '@cardiq/shared-types';
import { BankEntity } from './bank.entity';

@Entity('credit_cards')
export class CreditCardEntity implements ICreditCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  bankId: string;

  @ManyToOne(() => BankEntity, (bank) => bank.cards, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'bank_id' })
  bank: BankEntity;

  @Index()
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  slug: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  variant?: string;

  @Index()
  @Column({ type: 'enum', enum: CardNetwork })
  network: CardNetwork;

  @Column({ type: 'enum', enum: CardType, default: CardType.CREDIT })
  cardType: CardType;

  @Column({ type: 'enum', enum: CardTier, default: CardTier.ENTRY })
  tier: CardTier;

  // Fees (Stored in INR exactly)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  joiningFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  annualFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  renewalFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  feeWaiverSpend?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  addOnFee?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 3.5 })
  forexMarkup: number;

  // Rewards
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  baseRewardRate: number;

  @Column({ type: 'enum', enum: RewardType })
  rewardType: RewardType;

  @Column({ type: 'varchar', length: 50, default: 'Points' })
  rewardCurrency: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0.25 })
  pointValueInr: number;

  // Benefits
  @Column({ type: 'int', default: 0 })
  loungeAccessDomestic?: number;

  @Column({ type: 'int', default: 0 })
  loungeAccessInternational?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  loungeNetwork?: string;

  @Column({ type: 'int', default: 0 })
  golfBenefits?: number;

  @Column({ type: 'boolean', default: false })
  concierge: boolean;

  @Column({ type: 'boolean', default: false })
  fuelSurchargeWaiver: boolean;

  // UPI
  @Index()
  @Column({ type: 'boolean', default: false })
  upiEnabled: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  upiRewardRate?: number;

  // Eligibility
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minSalary?: number;

  @Column({ type: 'int', nullable: true })
  minCreditScore?: number;

  // Metadata / Ranking
  @Index()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  popularityScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  confidenceScore: number;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: false })
  isDiscontinued: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Index()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
