import { AppShell } from '@/components/layout/AppShell';
import { ComparisonTable } from '@/components/discovery/ComparisonTable';
import { GlobalSearch } from '@/components/search/GlobalSearch';

const mockCompareCards = [
  { id: '1', name: 'HDFC Millennia', bank: 'HDFC Bank', category: 'cashback', rewardRate: '5%', annualFee: 1000 },
  { id: '2', name: 'Cashback SBI Card', bank: 'SBI Card', category: 'cashback', rewardRate: '5%', annualFee: 999 },
];

export default function ComparePage() {
  return (
    <AppShell isPublic>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compare Cards</h1>
            <p className="text-muted-foreground mt-2">Side-by-side analysis of fees, rewards, and benefits.</p>
          </div>
          <div className="w-full md:w-auto">
            {/* The global search works as a quick add for now */}
            <GlobalSearch />
          </div>
        </div>
        
        <div className="mt-8">
          <ComparisonTable cards={mockCompareCards} />
        </div>
      </div>
    </AppShell>
  );
}
