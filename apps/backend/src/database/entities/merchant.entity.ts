import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';
import { IMerchant, MerchantCategory } from '@cardiq/shared-types';

@Entity('merchants')
export class MerchantEntity implements IMerchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  // Trigram index for fuzzy matching during extraction and search
  @Index({ fulltext: true }) // We will configure the specific GIN index in migrations, but TypeORM will track this
  @Column({ type: 'varchar', length: 150 })
  normalizedName: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  slug: string;

  @Index()
  @Column({ type: 'enum', enum: MerchantCategory })
  category: MerchantCategory;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subCategory?: string;

  @Column({ type: 'varchar', array: true, default: [] })
  aliases: string[];

  @Column({ type: 'varchar', array: true, default: [] })
  mccCodes: string[];

  @Column({ type: 'varchar', array: true, default: [] })
  searchKeywords: string[];

  @Index()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  popularityScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  confidenceScore: number;

  @Column({ type: 'varchar', length: 50, default: 'UNVERIFIED' })
  verificationStatus: string;

  @Column({ type: 'int', default: 0 })
  sourcePriority: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Index()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
