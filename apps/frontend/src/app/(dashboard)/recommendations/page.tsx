import { AppShell } from '@/components/layout/AppShell';

export default function RecommendationsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Recommendations</h1>
          <p className="text-muted-foreground mt-1">Personalized card stacks based on your spending profile.</p>
        </div>
        
        <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed">
          Recommendation Engine connecting...
        </div>
      </div>
    </AppShell>
  );
}
