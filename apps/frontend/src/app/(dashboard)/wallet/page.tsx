import { AppShell } from '@/components/layout/AppShell';
import { WalletGrid } from '@/components/wallet/WalletGrid';
import { FeeTracker } from '@/components/wallet/FeeTracker';

export default function WalletPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Wallet</h1>
          <p className="text-muted-foreground mt-1">Manage your cards, track fee waivers, and view benefits.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WalletGrid />
          </div>
          <div>
            <FeeTracker />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
