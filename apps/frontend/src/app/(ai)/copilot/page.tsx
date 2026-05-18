import { AppShell } from '@/components/layout/AppShell';
import { SuggestedPrompts } from '@/components/ai/trust/SuggestedPrompts';
import { MessageComposer } from '@/components/ai/chat/MessageComposer';
import { Sparkles, History } from 'lucide-react';
import Link from 'next/link';

export default function CopilotHomePage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
        
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">CardIQ Copilot</h1>
          <p className="text-muted-foreground max-w-lg mb-8">
            Your personal financial assistant. I can explain optimization strategies, compare cards, and analyze your spending patterns.
          </p>
          
          <SuggestedPrompts />
        </div>

        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <History className="w-4 h-4" /> Recent Conversations
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Mock History Items */}
            <Link href="/chat/1" className="p-4 border rounded-xl hover:bg-muted/50 transition-colors text-left">
              <p className="text-sm font-medium">Explain why SBI Cashback is better for Amazon...</p>
              <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
            </Link>
            <Link href="/chat/2" className="p-4 border rounded-xl hover:bg-muted/50 transition-colors text-left">
              <p className="text-sm font-medium">How can I maximize my travel rewards?</p>
              <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
            </Link>
          </div>
        </div>

        <div className="sticky bottom-4 px-4 w-full">
          <MessageComposer />
          <p className="text-center text-[10px] text-muted-foreground mt-3">
            Calculations are deterministic. AI explanations are generated for clarity and context.
          </p>
        </div>

      </div>
    </AppShell>
  );
}
