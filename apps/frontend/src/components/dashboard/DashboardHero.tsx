import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export function DashboardHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground shadow-lg">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 right-20 w-24 h-24 bg-fintech-points/30 rounded-full blur-xl" />
      
      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" /> Good morning, JD
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">You're optimized for savings.</h2>
        <p className="text-primary-foreground/80 max-w-md mb-6">
          Your wallet is currently returning an average of 3.8% across all your regular spend categories.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
            Optimize Transaction
          </Button>
          <Button variant="outline" className="text-primary-foreground border-primary-foreground/30 hover:bg-white/10">
            View Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
}
