import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Cards';
import { AlertCircle } from 'lucide-react';

export function FeeTracker() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Fee Waivers <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Track Item 1 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">HDFC Millennia</span>
            <span className="text-muted-foreground">₹65k / ₹1L</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-muted-foreground">Spend ₹35,000 more by Oct 12 to waive ₹1,000 fee.</p>
        </div>

        {/* Track Item 2 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Axis ATLAS</span>
            <span className="text-muted-foreground">₹2.1L / ₹3L</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: '70%' }} />
          </div>
          <p className="text-xs text-muted-foreground">Spend ₹90,000 more by Dec 01 to waive ₹5,000 fee.</p>
        </div>
        
        {/* Warning Box */}
        <div className="mt-4 bg-warning/10 border border-warning/20 rounded-lg p-3 flex gap-3">
          <AlertCircle className="w-5 h-5 text-warning shrink-0" />
          <p className="text-xs text-warning-foreground">HDFC fee renewal is approaching in 45 days. We will prioritize this card in optimizations.</p>
        </div>

      </CardContent>
    </Card>
  );
}
