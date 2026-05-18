'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Cards';
import { Badge } from '../ui/Indicators';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { AIInsightPanel } from '../ai/AIInsightPanel';

export function OptimizationResultCard() {
  // In a real implementation, this would read from the useOptimizer hook data/state
  const hasResult = true;

  if (!hasResult) return null;

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Primary Result */}
      <Card className="border-success/50 bg-success/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CheckCircle2 className="w-24 h-24 text-success" />
        </div>
        
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="success">Best Match</Badge>
            <span className="text-sm font-medium text-muted-foreground">Highest return for Amazon (MCC 5399)</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
            <div>
              <h2 className="text-3xl font-black text-foreground">SBI Cashback Card</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-xl font-bold text-success">5% Cashback</div>
                <div className="text-sm font-medium text-muted-foreground">Earnings: ₹250</div>
              </div>
            </div>
            
            <AIInsightPanel summary="SBI Cashback offers a flat 5% on all online spends. No category exclusions apply for Amazon India." />
          </div>
        </CardContent>
      </Card>

      {/* Alternative/Warning Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alternative Card */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Alternative</p>
              <h4 className="font-bold">HDFC Millennia</h4>
              <p className="text-sm text-muted-foreground">Earnings: ₹250 (5% Cashback)</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary">Equal Return</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Warning / Exclusion */}
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-warning-foreground uppercase tracking-wider mb-1">Notice</p>
              <h4 className="font-bold text-sm">Axis ATLAS Excluded</h4>
              <p className="text-xs text-muted-foreground">Axis ATLAS excludes utilities and e-commerce wallet loads. If this is a wallet load, you will earn 0 miles.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
