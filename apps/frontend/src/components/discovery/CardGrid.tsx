'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Percent, Plane, Coffee } from 'lucide-react';
import { Card, CardContent } from '../ui/Cards';
import { Badge } from '../ui/Indicators';

interface CardItem {
  id: string;
  slug: string;
  name: string;
  bank: string;
  category: 'cashback' | 'travel' | 'lifestyle';
  rewardRate: string;
  annualFee: number;
}

const mockCards: CardItem[] = [
  { id: '1', slug: 'hdfc-millennia', name: 'HDFC Millennia', bank: 'HDFC Bank', category: 'cashback', rewardRate: 'Up to 5%', annualFee: 1000 },
  { id: '2', slug: 'sbi-cashback', name: 'Cashback SBI Card', bank: 'SBI Card', category: 'cashback', rewardRate: 'Flat 5%', annualFee: 999 },
  { id: '3', slug: 'axis-atlas', name: 'Axis ATLAS', bank: 'Axis Bank', category: 'travel', rewardRate: 'Up to 10% (Miles)', annualFee: 5000 },
];

export function CardGrid({ categoryFilter }: { categoryFilter?: string }) {
  const displayCards = categoryFilter 
    ? mockCards.filter(c => c.category === categoryFilter)
    : mockCards;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayCards.map(card => (
        <Link key={card.id} href={`/cards/${card.slug}`} className="group">
          <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 group-hover:-translate-y-1">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.bank}</p>
                  <h3 className="font-bold text-lg text-foreground mt-1 line-clamp-2">{card.name}</h3>
                </div>
                {card.category === 'cashback' && <div className="w-8 h-8 rounded-full bg-fintech-cashback/10 flex items-center justify-center text-fintech-cashback"><Percent className="w-4 h-4" /></div>}
                {card.category === 'travel' && <div className="w-8 h-8 rounded-full bg-fintech-miles/10 flex items-center justify-center text-fintech-miles"><Plane className="w-4 h-4" /></div>}
              </div>

              <div className="space-y-3 mt-auto">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Reward Rate</span>
                  <span className="text-sm font-semibold">{card.rewardRate}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Annual Fee</span>
                  <span className="text-sm font-semibold">₹{card.annualFee}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center text-sm font-medium text-primary">
                View Details <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
