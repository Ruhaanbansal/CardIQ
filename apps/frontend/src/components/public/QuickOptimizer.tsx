'use client';

import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Cards';
import { Input } from '../ui/Forms';
import { Button } from '../ui/Button';

export function QuickOptimizer() {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !merchant) return;
    setAnalyzing(true);
    // Simulate latency then push to signup/onboarding funnel
    setTimeout(() => {
      window.location.href = `/onboarding?m=${encodeURIComponent(merchant)}&a=${amount}`;
    }, 1200);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
          
          {/* Left Text */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Try the Optimizer.
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
              Type in where you're shopping and how much you're spending. We'll tell you instantly which card in your wallet gives the highest return.
            </p>
            <ul className="space-y-3 text-sm text-left max-w-xs mx-auto lg:mx-0">
              <li className="flex items-center gap-2 text-foreground font-medium"><CheckIcon className="w-4 h-4 text-success" /> MCC Mapping</li>
              <li className="flex items-center gap-2 text-foreground font-medium"><CheckIcon className="w-4 h-4 text-success" /> Cap Awareness</li>
              <li className="flex items-center gap-2 text-foreground font-medium"><CheckIcon className="w-4 h-4 text-success" /> Exclusion Checking</li>
            </ul>
          </div>

          {/* Right UI Box */}
          <div className="flex-1 w-full max-w-md">
            <Card className="border-primary/20 shadow-xl shadow-primary/5">
              <CardContent className="p-6">
                <form onSubmit={handleSimulate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Merchant</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="e.g. Amazon, Uber, Swiggy..." 
                        className="pl-9 h-12"
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
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
                    className="w-full h-12 text-base mt-2" 
                    isLoading={analyzing}
                  >
                    {!analyzing && <>Find Best Card <ChevronRight className="ml-2 w-4 h-4" /></>}
                    {analyzing && "Analyzing 140+ cards..."}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    No sign up required to preview.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </section>
  );
}

function CheckIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12" /></svg>;
}
