import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Cards';
import { ShoppingCart, Plane, Coffee } from 'lucide-react';

const activities = [
  { id: 1, merchant: 'Amazon', amount: 5000, category: 'Shopping', cardUsed: 'SBI Cashback', saved: 250, date: '2 hours ago', icon: ShoppingCart, color: 'bg-fintech-cashback/10 text-fintech-cashback' },
  { id: 2, merchant: 'MakeMyTrip', amount: 12000, category: 'Travel', cardUsed: 'Axis ATLAS', saved: 1200, date: 'Yesterday', icon: Plane, color: 'bg-fintech-miles/10 text-fintech-miles' },
  { id: 3, merchant: 'Starbucks', amount: 450, category: 'Dining', cardUsed: 'HDFC Millennia', saved: 22, date: 'Yesterday', icon: Coffee, color: 'bg-orange-500/10 text-orange-500' },
];

export function RecentActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Optimizations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.merchant}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className="truncate max-w-[120px]">{item.cardUsed}</span>
                    <span className="mx-1.5">•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">₹{item.amount}</p>
                <p className="text-xs font-semibold text-success">+₹{item.saved} saved</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
