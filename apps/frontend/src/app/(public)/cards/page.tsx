import { AppShell } from '@/components/layout/AppShell';
import { FilterBar } from '@/components/discovery/FilterBar';
import { CardGrid } from '@/components/discovery/CardGrid';

// Force dynamic rendering to bypass Next.js 15.3.x static prerender bug
export const dynamic = 'force-dynamic';


export default function CardsDiscoveryPage() {
  return (
    <AppShell isPublic>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Discover Cards</h1>
          <p className="text-muted-foreground mt-2">Find the perfect credit card for your spending habits.</p>
        </div>
        
        <FilterBar />
        
        <div className="mt-8">
          <CardGrid />
        </div>
      </div>
    </AppShell>
  );
}
