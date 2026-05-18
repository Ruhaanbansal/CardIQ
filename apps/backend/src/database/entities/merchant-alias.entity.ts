import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { MerchantEntity } from './merchant.entity';

@Entity('merchant_aliases')
export class MerchantAliasEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  merchantId: string;

  @ManyToOne(() => MerchantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant: MerchantEntity;

  @Column({ type: 'varchar', length: 255 })
  alias: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  aliasNormalized: string;

  @Column({ type: 'varchar', length: 50, default: 'EXACT' })
  aliasType: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  confidenceScore: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
