import { DataSource } from 'typeorm';
import { MerchantEntity } from '../entities/merchant.entity';
import { MerchantCategory } from '@cardiq/shared-types';

export const seedMerchants = async (dataSource: DataSource) => {
  const repository = dataSource.getRepository(MerchantEntity);

  const merchants = [
    { name: 'Swiggy', normalizedName: 'swiggy', slug: 'swiggy', category: MerchantCategory.FOOD_DINING, aliases: ['swiggy.com', 'bundle tech'] },
    { name: 'Zomato', normalizedName: 'zomato', slug: 'zomato', category: MerchantCategory.FOOD_DINING, aliases: ['zomato.com'] },
    { name: 'Amazon India', normalizedName: 'amazon', slug: 'amazon-in', category: MerchantCategory.SHOPPING, aliases: ['amazon.in', 'amzn'] },
    { name: 'Flipkart', normalizedName: 'flipkart', slug: 'flipkart', category: MerchantCategory.SHOPPING, aliases: ['flipkart.com'] },
    { name: 'Myntra', normalizedName: 'myntra', slug: 'myntra', category: MerchantCategory.SHOPPING, aliases: ['myntra.com'] },
    { name: 'Uber India', normalizedName: 'uber', slug: 'uber-in', category: MerchantCategory.TRAVEL, aliases: ['uber.com', 'uber trips'] },
    { name: 'Ola Cabs', normalizedName: 'ola', slug: 'ola-cabs', category: MerchantCategory.TRAVEL, aliases: ['ola', 'ani technologies'] },
    { name: 'MakeMyTrip', normalizedName: 'makemytrip', slug: 'makemytrip', category: MerchantCategory.TRAVEL, aliases: ['mmt', 'makemytrip.com'] },
    { name: 'IRCTC', normalizedName: 'irctc', slug: 'irctc', category: MerchantCategory.TRAVEL, aliases: ['indian railways', 'irctc.co.in'] },
    { name: 'BigBasket', normalizedName: 'bigbasket', slug: 'bigbasket', category: MerchantCategory.GROCERY, aliases: ['big basket'] },
    { name: 'Blinkit', normalizedName: 'blinkit', slug: 'blinkit', category: MerchantCategory.GROCERY, aliases: ['grofers'] },
    { name: 'Zepto', normalizedName: 'zepto', slug: 'zepto', category: MerchantCategory.GROCERY, aliases: ['kirana kart'] },
    { name: 'Netflix', normalizedName: 'netflix', slug: 'netflix', category: MerchantCategory.ENTERTAINMENT, aliases: ['netflix.com'] },
    { name: 'Airtel', normalizedName: 'airtel', slug: 'airtel', category: MerchantCategory.UTILITIES, aliases: ['bharti airtel'] },
    { name: 'Jio', normalizedName: 'jio', slug: 'jio', category: MerchantCategory.UTILITIES, aliases: ['reliance jio'] },
    { name: 'BookMyShow', normalizedName: 'bookmyshow', slug: 'bookmyshow', category: MerchantCategory.ENTERTAINMENT, aliases: ['bms'] },
    { name: 'BPCL', normalizedName: 'bpcl', slug: 'bpcl', category: MerchantCategory.FUEL, aliases: ['bharat petroleum'] },
    { name: 'HPCL', normalizedName: 'hpcl', slug: 'hpcl', category: MerchantCategory.FUEL, aliases: ['hindustan petroleum'] },
    { name: 'Indian Oil', normalizedName: 'iocl', slug: 'indian-oil', category: MerchantCategory.FUEL, aliases: ['iocl'] },
  ];

  for (const merchant of merchants) {
    const exists = await repository.findOne({ where: { slug: merchant.slug } });
    if (!exists) {
      await repository.save({
        ...merchant,
        popularityScore: 100,
        confidenceScore: 100,
        sourcePriority: 1,
      });
      console.log(`Seeded Merchant: ${merchant.name}`);
    }
  }
};
