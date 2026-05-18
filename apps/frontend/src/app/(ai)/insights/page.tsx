import { AppShell } from '@/components/layout/AppShell';
import { AIInsightFeed } from '@/components/ai/trust/AIInsightFeed';
import { Sparkles } from 'lucide-react';

export default function InsightsPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> AI Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized opportunities and warnings based on your spending patterns.
          </p>
        </div>
        
        <AIInsightFeed />
      </div>
    </AppShell>
  );
}
