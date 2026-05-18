import dataSource from '../typeorm.config';
import { seedBanks } from './bank.seeder';
import { seedCreditCards } from './credit-card.seeder';
import { seedMerchants } from './merchant.seeder';

const runSeeds = async () => {
  try {
    console.log('Initializing Database Connection...');
    await dataSource.initialize();
    
    console.log('Running Banks Seeder...');
    await seedBanks(dataSource);
    
    console.log('Running Credit Cards Seeder...');
    await seedCreditCards(dataSource);
    
    console.log('Running Merchants Seeder...');
    await seedMerchants(dataSource);
    
    console.log('Seeding Complete!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
  }
};

runSeeds();
