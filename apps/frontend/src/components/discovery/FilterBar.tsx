'use client';

import React from 'react';
import { SlidersHorizontal, Search } from 'lucide-react';
import { Input } from '../ui/Forms';
import { Button } from '../ui/Button';

export function FilterBar() {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 py-4 border-b bg-background sticky top-16 z-30">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search credit cards..." className="pl-9 bg-muted/50" />
      </div>
      
      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
        <Button variant="outline" size="sm" className="shrink-0 bg-primary/5 border-primary/20 text-primary">All Cards</Button>
        <Button variant="ghost" size="sm" className="shrink-0">Cashback</Button>
        <Button variant="ghost" size="sm" className="shrink-0">Travel & Lounge</Button>
        <Button variant="ghost" size="sm" className="shrink-0">Fuel</Button>
        <Button variant="outline" size="sm" className="ml-auto shrink-0">
          <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
        </Button>
      </div>
    </div>
  );
}
