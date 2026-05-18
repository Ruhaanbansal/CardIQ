import { DataSource } from 'typeorm';
import { BankEntity } from '../entities/bank.entity';

export const seedBanks = async (dataSource: DataSource) => {
  const repository = dataSource.getRepository(BankEntity);

  const banks = [
    { name: 'HDFC Bank', slug: 'hdfc-bank', shortName: 'HDFC', isActive: true },
    { name: 'SBI Card', slug: 'sbi-card', shortName: 'SBI', isActive: true },
    { name: 'ICICI Bank', slug: 'icici-bank', shortName: 'ICICI', isActive: true },
    { name: 'Axis Bank', slug: 'axis-bank', shortName: 'Axis', isActive: true },
    { name: 'Kotak Mahindra Bank', slug: 'kotak-mahindra-bank', shortName: 'Kotak', isActive: true },
    { name: 'IndusInd Bank', slug: 'indusind-bank', shortName: 'IndusInd', isActive: true },
    { name: 'American Express', slug: 'american-express', shortName: 'Amex', isActive: true },
    { name: 'RBL Bank', slug: 'rbl-bank', shortName: 'RBL', isActive: true },
    { name: 'AU Small Finance Bank', slug: 'au-small-finance-bank', shortName: 'AU Bank', isActive: true },
    { name: 'Yes Bank', slug: 'yes-bank', shortName: 'Yes', isActive: true },
    { name: 'HSBC India', slug: 'hsbc-india', shortName: 'HSBC', isActive: true },
    { name: 'Standard Chartered', slug: 'standard-chartered', shortName: 'StanChart', isActive: true },
    { name: 'IDFC FIRST Bank', slug: 'idfc-first-bank', shortName: 'IDFC FIRST', isActive: true },
    { name: 'Federal Bank', slug: 'federal-bank', shortName: 'Federal', isActive: true },
    { name: 'OneCard', slug: 'onecard', shortName: 'OneCard', isActive: true },
    { name: 'SBM Bank', slug: 'sbm-bank', shortName: 'SBM', isActive: true },
    { name: 'Bank of Baroda', slug: 'bank-of-baroda', shortName: 'BOB', isActive: true },
    { name: 'Punjab National Bank', slug: 'punjab-national-bank', shortName: 'PNB', isActive: true },
    { name: 'Canara Bank', slug: 'canara-bank', shortName: 'Canara', isActive: true },
    { name: 'DBS Bank India', slug: 'dbs-india', shortName: 'DBS', isActive: true },
    { name: 'Union Bank of India', slug: 'union-bank-of-india', shortName: 'Union Bank', isActive: true },
    { name: 'Indian Bank', slug: 'indian-bank', shortName: 'Indian Bank', isActive: true },
    { name: 'UCO Bank', slug: 'uco-bank', shortName: 'UCO', isActive: true },
    { name: 'CSB Bank', slug: 'csb-bank', shortName: 'CSB', isActive: true },
  ];

  for (const bank of banks) {
    const exists = await repository.findOne({ where: { slug: bank.slug } });
    if (!exists) {
      await repository.save(bank);
      console.log(`Seeded Bank: ${bank.name}`);
    }
  }
};
