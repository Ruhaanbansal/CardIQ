import React from 'react';
import { Sparkles } from 'lucide-react';
import { ConfidenceIndicator } from '../trust/ConfidenceIndicator';

export function StreamingMessage({ content }: { content: string }) {
  return (
    <div className="flex gap-4 w-full">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1 text-primary relative overflow-hidden">
        <Sparkles className="w-4 h-4 relative z-10" />
        <div className="absolute inset-0 bg-primary/20 animate-pulse" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-muted-foreground">Generating explanation...</span>
          {content && <ConfidenceIndicator level="high" />}
        </div>
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {content}
          <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
        </div>
      </div>
    </div>
  );
}
