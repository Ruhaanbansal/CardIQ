import React from 'react';
import { Calculator, ExternalLink } from 'lucide-react';

export function CalculationReferenceCard() {
  return (
    <div className="bg-muted/50 border border-muted-foreground/20 rounded-lg p-3 max-w-sm flex items-start gap-3">
      <div className="w-8 h-8 rounded bg-background flex items-center justify-center shrink-0 shadow-sm">
        <Calculator className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-0.5">Deterministic Source</p>
        <p className="text-xs text-muted-foreground">
          This AI summary is based on verified mathematical outputs from the 
          <span className="font-medium text-foreground"> Transaction Optimizer Engine (v1.2)</span>.
        </p>
        <button className="text-[10px] font-medium text-primary flex items-center gap-1 mt-2 hover:underline">
          View raw calculation data <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
