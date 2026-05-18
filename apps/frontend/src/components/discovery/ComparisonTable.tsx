'use client';

import React from 'react';
import { Check, Minus } from 'lucide-react';

interface ComparisonTableProps {
  cards: any[];
}

export function ComparisonTable({ cards }: ComparisonTableProps) {
  if (cards.length === 0) return <div className="p-8 text-center border rounded-lg">Select cards to compare</div>;

  return (
    <div className="overflow-x-auto border rounded-xl shadow-sm bg-card">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="p-4 font-semibold text-muted-foreground w-1/4">Features</th>
            {cards.map(c => (
              <th key={c.id} className="p-4 font-bold text-foreground w-1/3">
                <div className="text-xs text-muted-foreground font-normal mb-1">{c.bank}</div>
                <div className="text-base">{c.name}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {/* Annual Fee row */}
          <tr>
            <td className="p-4 font-medium text-foreground bg-muted/20">Annual Fee</td>
            {cards.map(c => (
              <td key={c.id} className="p-4">₹{c.annualFee}</td>
            ))}
          </tr>
          
          {/* Reward Rate row */}
          <tr>
            <td className="p-4 font-medium text-foreground bg-muted/20">Base Reward Rate</td>
            {cards.map(c => (
              <td key={c.id} className="p-4 font-medium text-fintech-cashback">{c.rewardRate}</td>
            ))}
          </tr>
          
          {/* Lounge row */}
          <tr>
            <td className="p-4 font-medium text-foreground bg-muted/20">Domestic Lounge</td>
            {cards.map(c => (
              <td key={c.id} className="p-4">
                {c.category === 'travel' 
                  ? <div className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /> 8 per year</div>
                  : <div className="flex items-center gap-2 text-muted-foreground"><Minus className="w-4 h-4" /> None</div>
                }
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
