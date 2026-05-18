import React from 'react';
import { Sparkles } from 'lucide-react';
import { ConfidenceIndicator } from '../trust/ConfidenceIndicator';
import { CalculationReferenceCard } from '../trust/CalculationReferenceCard';

export function AIMessage({ content }: { content: string }) {
  return (
    <div className="flex gap-4 w-full">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1 text-primary">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">CardIQ Assistant</span>
          <ConfidenceIndicator level="high" />
        </div>
        
        {/* Simple mock markdown rendering for now */}
        <div className="text-sm text-foreground leading-relaxed space-y-2 whitespace-pre-wrap">
          {content}
        </div>

        {/* Example inline trust injection */}
        {content.includes('deterministic calculation') && (
          <div className="mt-4">
            <CalculationReferenceCard />
          </div>
        )}
      </div>
    </div>
  );
}
