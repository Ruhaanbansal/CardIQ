import { AppShell } from '@/components/layout/AppShell';
import { SpendBreakdownChart } from '@/components/analytics/SpendBreakdownChart';
import { SavingsTrendChart } from '@/components/analytics/SavingsTrendChart';

// Force dynamic rendering to bypass Next.js 15.3.x static prerender bug
export const dynamic = 'force-dynamic';


export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your spending and optimization history.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendBreakdownChart />
          <SavingsTrendChart />
        </div>
      </div>
    </AppShell>
  );
}
