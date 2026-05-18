'use client';

import React from 'react';
import { useWallet } from '../../hooks/api/useWallet';
import { Skeleton } from '../ui/Indicators';
import { Card, CardContent } from '../ui/Cards';
import { CreditCard, MoreVertical, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export function WalletGrid() {
  const { data: cards, isLoading } = useWallet();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Add New Card Button */}
      <button className="h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors group">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <Plus className="w-6 h-6" />
        </div>
        <span className="font-medium">Add New Card</span>
      </button>

      {/* Wallet Cards */}
      {cards?.map((card) => (
        <WalletCard key={card.id} card={card} />
      ))}
    </div>
  );
}

function WalletCard({ card }: { card: any }) {
  // Generate a determinisic gradient based on the card name length for placeholder UI
  const gradients = [
    'from-blue-600 to-cyan-500',
    'from-indigo-600 to-purple-500',
    'from-emerald-600 to-teal-500',
    'from-slate-800 to-slate-600'
  ];
  const bgClass = gradients[card.cardName.length % gradients.length];

  return (
    <div className={`relative h-48 rounded-2xl p-6 overflow-hidden text-white bg-gradient-to-br ${bgClass} shadow-md`}>
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-white/80 uppercase tracking-wider">{card.bankName}</p>
            <h3 className="text-lg font-bold mt-1 line-clamp-1">{card.cardName}</h3>
          </div>
          <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-white/90" />
          </button>
        </div>

        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] text-white/70 uppercase">Base Reward</p>
            <p className="font-semibold">{card.baseRewardRate}%</p>
          </div>
          <CreditCard className="w-8 h-8 text-white/50" />
        </div>
      </div>
    </div>
  );
}
