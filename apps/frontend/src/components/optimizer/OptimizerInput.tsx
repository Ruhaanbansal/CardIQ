'use client';

import React, { useState } from 'react';
import { useOptimizer } from '../../hooks/api/useOptimizer';
import { Card, CardContent } from '../ui/Cards';
import { Input } from '../ui/Forms';
import { Button } from '../ui/Button';
import { Search, ChevronRight } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';

export function OptimizerInput() {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const { mutate: optimize, isPending } = useOptimizer();
  const addNotification = useNotificationStore(state => state.add);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !amount) return;

    optimize({ merchantName: merchant, amount: Number(amount) }, {
      onSuccess: () => {
        addNotification({ type: 'success', title: 'Optimization Complete', message: `Found the best card for ${merchant}.` });
      },
      onError: () => {
        addNotification({ type: 'error', title: 'Optimization Failed', message: 'Unable to process transaction. Please try again.' });
      }
    });
  };

  return (
    <Card className="shadow-lg border-primary/20">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 w-full md:w-1/2">
            <label className="text-sm font-semibold">Where are you spending?</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="e.g. Amazon, Uber, Zomato..." 
                className="pl-9 h-12"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2 w-full md:w-1/4">
            <label className="text-sm font-semibold">Amount (₹)</label>
            <Input 
              type="number" 
              placeholder="5000" 
              className="h-12"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full md:w-1/4 h-12 text-base" 
            isLoading={isPending}
          >
            Optimize <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
