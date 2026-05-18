import { DataSource } from 'typeorm';
import { CreditCardEntity } from '../entities/credit-card.entity';
import { BankEntity } from '../entities/bank.entity';
import { CardNetwork, CardType, CardTier, RewardType } from '@cardiq/shared-types';

export const seedCreditCards = async (dataSource: DataSource) => {
  const cardRepo = dataSource.getRepository(CreditCardEntity);
  const bankRepo = dataSource.getRepository(BankEntity);

  const hdfc = await bankRepo.findOne({ where: { slug: 'hdfc-bank' } });
  const sbi = await bankRepo.findOne({ where: { slug: 'sbi-card' } });
  const icici = await bankRepo.findOne({ where: { slug: 'icici-bank' } });
  const axis = await bankRepo.findOne({ where: { slug: 'axis-bank' } });
  const amex = await bankRepo.findOne({ where: { slug: 'american-express' } });

  if (!hdfc || !sbi || !icici || !axis || !amex) {
    console.error('Banks must be seeded before Credit Cards');
    return;
  }

  const cards = [
    // HDFC
    { bank: hdfc, name: 'HDFC Regalia Gold', slug: 'hdfc-regalia-gold', network: CardNetwork.VISA, cardType: CardType.CREDIT, tier: CardTier.PREMIUM, joiningFee: 2500, annualFee: 2500, rewardType: RewardType.REWARD_POINTS, rewardCurrency: 'Points', pointValueInr: 0.5 },
    { bank: hdfc, name: 'HDFC Millennia', slug: 'hdfc-millennia', network: CardNetwork.VISA, cardType: CardType.CREDIT, tier: CardTier.MID_RANGE, joiningFee: 1000, annualFee: 1000, rewardType: RewardType.CASHBACK, rewardCurrency: 'CashPoints', pointValueInr: 1 },
    { bank: hdfc, name: 'Swiggy HDFC Bank', slug: 'swiggy-hdfc', network: CardNetwork.MASTERCARD, cardType: CardType.CREDIT, tier: CardTier.ENTRY, joiningFee: 500, annualFee: 500, rewardType: RewardType.CASHBACK, rewardCurrency: 'Cashback', pointValueInr: 1 },
    { bank: hdfc, name: 'Tata Neu Infinity HDFC', slug: 'tata-neu-infinity-hdfc', network: CardNetwork.RUPAY, cardType: CardType.CREDIT, tier: CardTier.PREMIUM, joiningFee: 1499, annualFee: 1499, rewardType: RewardType.COBRAND_POINTS, rewardCurrency: 'NeuCoins', pointValueInr: 1, upiEnabled: true },
    { bank: hdfc, name: 'HDFC Diners Club Black', slug: 'hdfc-diners-club-black', network: CardNetwork.DINERS_CLUB, cardType: CardType.CREDIT, tier: CardTier.SUPER_PREMIUM, joiningFee: 10000, annualFee: 10000, rewardType: RewardType.REWARD_POINTS, rewardCurrency: 'Points', pointValueInr: 1 },
    
    // SBI
    { bank: sbi, name: 'Cashback SBI Card', slug: 'cashback-sbi-card', network: CardNetwork.VISA, cardType: CardType.CREDIT, tier: CardTier.MID_RANGE, joiningFee: 0, annualFee: 999, rewardType: RewardType.CASHBACK, rewardCurrency: 'Cashback', pointValueInr: 1 },
    { bank: sbi, name: 'BPCL SBI Card OCTANE', slug: 'bpcl-sbi-octane', network: CardNetwork.VISA, cardType: CardType.CREDIT, tier: CardTier.PREMIUM, joiningFee: 1499, annualFee: 1499, rewardType: RewardType.REWARD_POINTS, rewardCurrency: 'Points', pointValueInr: 0.25 },
    { bank: sbi, name: 'SimplyCLICK SBI Card', slug: 'simplyclick-sbi', network: CardNetwork.VISA, cardType: CardType.CREDIT, tier: CardTier.ENTRY, joiningFee: 499, annualFee: 499, rewardType: RewardType.REWARD_POINTS, rewardCurrency: 'Points', pointValueInr: 0.25 },

    // ICICI
    { bank: icici, name: 'Amazon Pay ICICI', slug: 'amazon-pay-icici', network: CardNetwork.VISA, cardType: CardType.CREDIT, tier: CardTier.ENTRY, joiningFee: 0, annualFee: 0, rewardType: RewardType.CASHBACK, rewardCurrency: 'Amazon Pay Balance', pointValueInr: 1 },
    { bank: icici, name: 'ICICI Coral', slug: 'icici-coral', network: CardNetwork.VISA, cardType: CardType.CREDIT, tier: CardTier.ENTRY, joiningFee: 500, annualFee: 500, rewardType: RewardType.REWARD_POINTS, rewardCurrency: 'Points', pointValueInr: 0.25 },
    { bank: icici, name: 'ICICI Sapphiro', slug: 'icici-sapphiro', network: CardNetwork.VISA, cardType: CardType.CREDIT, tier: CardTier.PREMIUM, joiningFee: 6500, annualFee: 3500, rewardType: RewardType.REWARD_POINTS, rewardCurrency: 'Points', pointValueInr: 0.25 },

    // Axis
    { bank: axis, name: 'Axis Bank Atlas', slug: 'axis-atlas', network: CardNetwork.VISA, cardType: CardType.CREDIT, tier: CardTier.PREMIUM, joiningFee: 5000, annualFee: 5000, rewardType: RewardType.AIRMILES, rewardCurrency: 'Edge Miles', pointValueInr: 1 },
    { bank: axis, name: 'Axis Bank Ace', slug: 'axis-ace', network: CardNetwork.VISA, cardType: CardType.CREDIT, tier: CardTier.ENTRY, joiningFee: 499, annualFee: 499, rewardType: RewardType.CASHBACK, rewardCurrency: 'Cashback', pointValueInr: 1 },
    { bank: axis, name: 'Axis Bank Magnus', slug: 'axis-magnus', network: CardNetwork.VISA, cardType: CardType.CREDIT, tier: CardTier.SUPER_PREMIUM, joiningFee: 12500, annualFee: 12500, rewardType: RewardType.REWARD_POINTS, rewardCurrency: 'Edge Rewards', pointValueInr: 0.2 },
    { bank: axis, name: 'Flipkart Axis Bank', slug: 'flipkart-axis', network: CardNetwork.VISA, cardType: CardType.CREDIT, tier: CardTier.ENTRY, joiningFee: 500, annualFee: 500, rewardType: RewardType.CASHBACK, rewardCurrency: 'Cashback', pointValueInr: 1 },

    // Amex
    { bank: amex, name: 'American Express Platinum', slug: 'amex-platinum', network: CardNetwork.AMEX, cardType: CardType.CREDIT, tier: CardTier.SUPER_PREMIUM, joiningFee: 60000, annualFee: 60000, rewardType: RewardType.REWARD_POINTS, rewardCurrency: 'MR Points', pointValueInr: 0.5 },
    { bank: amex, name: 'American Express Gold', slug: 'amex-gold-charge', network: CardNetwork.AMEX, cardType: CardType.CREDIT, tier: CardTier.PREMIUM, joiningFee: 1000, annualFee: 4500, rewardType: RewardType.REWARD_POINTS, rewardCurrency: 'MR Points', pointValueInr: 0.5 },
    { bank: amex, name: 'American Express SmartEarn', slug: 'amex-smartearn', network: CardNetwork.AMEX, cardType: CardType.CREDIT, tier: CardTier.ENTRY, joiningFee: 495, annualFee: 495, rewardType: RewardType.REWARD_POINTS, rewardCurrency: 'MR Points', pointValueInr: 0.25 },
  ];

  for (const card of cards) {
    const exists = await cardRepo.findOne({ where: { slug: card.slug } });
    if (!exists) {
      await cardRepo.save({
        ...card,
        baseRewardRate: 1,
        forexMarkup: 3.5,
        isActive: true,
        popularityScore: 100,
        confidenceScore: 100,
        concierge: false,
        fuelSurchargeWaiver: false,
      });
      console.log(`Seeded Credit Card: ${card.name}`);
    }
  }
};
