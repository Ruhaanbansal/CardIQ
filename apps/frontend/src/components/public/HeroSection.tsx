'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-fintech-points/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-fintech-cashback/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <SparklesIcon className="w-4 h-4" />
          <span>CardIQ AI Engine is Live</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight max-w-4xl mx-auto leading-tight">
          Stop Guessing. Start <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-fintech-points">Optimizing</span> Your Credit Cards.
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          AI-powered deterministic calculations to find you the absolute best credit card for every single transaction. Maximize cashback, points, and miles effortlessly.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/onboarding" passHref>
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base shadow-lg shadow-primary/20">
              Start Optimizing Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/cards" passHref>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base">
              Browse Cards
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto border-t pt-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-fintech-cashback/10 flex items-center justify-center text-fintech-cashback mb-2">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl">₹40k+</h3>
            <p className="text-sm text-muted-foreground">Average Annual Savings</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-fintech-points/10 flex items-center justify-center text-fintech-points mb-2">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl">Real-time</h3>
            <p className="text-sm text-muted-foreground">Transaction Optimization</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl">100%</h3>
            <p className="text-sm text-muted-foreground">Deterministic Accuracy</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
