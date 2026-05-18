import { Entity, Column, PrimaryColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { MerchantEntity } from './merchant.entity';

@Entity('merchant_mcc_mappings')
export class MerchantMccMappingEntity {
  @PrimaryColumn({ type: 'varchar', length: 10 })
  mccCode: string;

  @Index()
  @Column('uuid', { nullable: true })
  merchantId?: string;

  @ManyToOne(() => MerchantEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'merchant_id' })
  merchant?: MerchantEntity;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 50 })
  confidenceScore: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
