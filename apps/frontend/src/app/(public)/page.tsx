import { HeroSection } from '@/components/public/HeroSection';
import { TrustIndicators } from '@/components/public/TrustIndicators';
import { QuickOptimizer } from '@/components/public/QuickOptimizer';
import { AppShell } from '@/components/layout/AppShell';

// Skip static pre-rendering — bypasses Next.js 15.3.x entryCSSFiles bug
// with mixed server/client component pages
export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <AppShell isPublic>
      <main className="flex flex-col min-h-screen">
        <HeroSection />
        <TrustIndicators />
        <QuickOptimizer />
      </main>
    </AppShell>
  );
}
