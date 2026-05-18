'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, CreditCard, Store } from 'lucide-react';
import { Input } from '../ui/Forms';
import { useRouter } from 'next/navigation';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Handle Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted/50 rounded-lg border hover:bg-muted transition-colors w-full md:w-64"
      >
        <Search className="w-4 h-4" />
        <span>Search cards, categories...</span>
        <kbd className="hidden md:inline-flex ml-auto text-[10px] bg-background px-1.5 py-0.5 rounded border">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsOpen(false)} 
      />
      
      <div className="relative bg-background border shadow-2xl rounded-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b px-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input 
            autoFocus
            className="border-0 focus-visible:ring-0 h-14 text-base bg-transparent shadow-none"
            placeholder="Search for cards (e.g. HDFC Millennia)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dummy Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.length > 0 ? (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground px-3 py-2">Cards</div>
              <SearchResult icon={CreditCard} title="HDFC Millennia Credit Card" desc="5% Cashback on Top Brands" onClick={() => { setIsOpen(false); router.push('/cards/hdfc-millennia'); }} />
              <SearchResult icon={CreditCard} title="SBI SimplyCLICK" desc="10x Rewards on Online Spends" onClick={() => { setIsOpen(false); router.push('/cards/sbi-simplyclick'); }} />
              
              <div className="text-xs font-semibold text-muted-foreground px-3 py-2 mt-2">Merchants</div>
              <SearchResult icon={Store} title="Amazon India" desc="E-commerce (MCC 5399)" onClick={() => { setIsOpen(false); router.push('/optimizer?m=amazon'); }} />
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Type to search for credit cards, banks, or merchants to optimize.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResult({ icon: Icon, title, desc, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors text-left"
    >
      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </button>
  );
}
