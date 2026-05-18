import { HeroSection } from '@/components/public/HeroSection';
import { TrustIndicators } from '@/components/public/TrustIndicators';
import { QuickOptimizer } from '@/components/public/QuickOptimizer';
import { AppShell } from '@/components/layout/AppShell';

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
