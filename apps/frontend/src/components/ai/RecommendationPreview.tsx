import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Cards';
import { Button } from '../ui/Button';
import { Sparkles, ChevronRight } from 'lucide-react';

export function RecommendationPreview() {
  return (
    <Card className="border-primary/20 bg-primary/5 h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" /> Smart Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/80 mb-6">
          Based on your high travel spend last month, adding the <strong>Axis ATLAS</strong> card to your wallet could increase your annual savings by ₹12,400.
        </p>
        
        <div className="space-y-4">
          <div className="bg-background rounded-lg p-4 border shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-fintech-miles/10 flex items-center justify-center text-fintech-miles font-bold text-xs">
              AXIS
            </div>
            <div>
              <h4 className="font-semibold text-sm">Axis ATLAS</h4>
              <p className="text-xs text-muted-foreground">Up to 10% on Travel</p>
            </div>
          </div>
        </div>

        <Button className="w-full mt-6" variant="outline">
          View Full Analysis <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
