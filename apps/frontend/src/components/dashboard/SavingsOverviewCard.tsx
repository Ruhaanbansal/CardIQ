import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Cards';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

export function SavingsOverviewCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Total YTD Savings</CardTitle>
        <Wallet className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">₹14,250</div>
        <div className="flex items-center gap-1 mt-1">
          <span className="flex items-center text-xs text-success font-medium">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12.5%
          </span>
          <span className="text-xs text-muted-foreground">vs last year</span>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-fintech-cashback" />
              <span className="text-sm text-muted-foreground">Cashback Earned</span>
            </div>
            <span className="text-sm font-semibold">₹8,500</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-fintech-points" />
              <span className="text-sm text-muted-foreground">Points Value</span>
            </div>
            <span className="text-sm font-semibold">₹4,250</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-fintech-miles" />
              <span className="text-sm text-muted-foreground">Lounge/Travel</span>
            </div>
            <span className="text-sm font-semibold">₹1,500</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
