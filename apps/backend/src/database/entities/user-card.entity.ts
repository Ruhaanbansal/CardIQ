import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { CreditCardEntity } from './credit-card.entity';

@Entity('user_cards')
export class UserCardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Index()
  @Column('uuid')
  cardId: string;

  @ManyToOne(() => CreditCardEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: CreditCardEntity;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  issuedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
