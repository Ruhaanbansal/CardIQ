import { AppShell } from '@/components/layout/AppShell';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { SavingsOverviewCard } from '@/components/dashboard/SavingsOverviewCard';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { RecommendationPreview } from '@/components/ai/RecommendationPreview';

export default function DashboardHomePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <DashboardHero />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <SavingsOverviewCard />
            <RecentActivityFeed />
          </div>
          <div className="space-y-6">
            <RecommendationPreview />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
