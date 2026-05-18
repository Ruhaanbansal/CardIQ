import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIInsightPanelProps {
  summary: string;
}

export function AIInsightPanel({ summary }: AIInsightPanelProps) {
  return (
    <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 max-w-sm">
      <div className="flex items-center gap-1.5 mb-2 text-primary font-semibold text-xs">
        <Sparkles className="w-3.5 h-3.5" />
        AI Reasoning
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">
        {summary}
      </p>
    </div>
  );
}
