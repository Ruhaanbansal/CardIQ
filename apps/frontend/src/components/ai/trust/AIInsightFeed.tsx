import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../../ui/Cards';
import { Button } from '../../ui/Button';

export function AIInsightFeed() {
  return (
    <div className="space-y-4">
      {/* Insight 1: Savings Opportunity */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">Travel Spend Anomaly</h3>
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase">Opportunity</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Your travel spending has increased by 45% this quarter. The AI analysis indicates you are currently earning 1% cashback on these transactions. Upgrading to a dedicated travel card like Axis ATLAS would yield approximately ₹4,500 in additional value.
            </p>
            <div className="flex gap-3">
              <Button size="sm">View Calculation</Button>
              <Button size="sm" variant="outline">Dismiss</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insight 2: Cap Warning */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-5 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">Approaching Cashback Cap</h3>
              <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning-foreground text-[10px] font-bold uppercase">Warning</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You are within ₹2,000 of the monthly cashback cap (₹5,000) on your SBI Cashback card. The Optimizer Engine will automatically route your next online purchases to HDFC Millennia once this cap is hit.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
