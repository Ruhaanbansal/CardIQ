import { AppShell } from '@/components/layout/AppShell';
import { OptimizerInput } from '@/components/optimizer/OptimizerInput';
import { OptimizationResultCard } from '@/components/optimizer/OptimizationResultCard';

export default function OptimizerPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Real-Time Optimizer</h1>
          <p className="text-muted-foreground mt-1">Find the absolute best card in your wallet for any transaction.</p>
        </div>
        
        <OptimizerInput />
        <OptimizationResultCard />
      </div>
    </AppShell>
  );
}
