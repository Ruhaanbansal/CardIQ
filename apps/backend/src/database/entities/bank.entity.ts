import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';
import { IBank } from '@cardiq/shared-types';
import { CreditCardEntity } from './credit-card.entity';

@Entity('banks')
export class BankEntity implements IBank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shortName?: string;

  @Column({ type: 'varchar', nullable: true })
  logoUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  websiteUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  customerSupportUrl?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  customerCareNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  headquarters?: string;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => CreditCardEntity, (card) => card.bank)
  cards: CreditCardEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Index()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
