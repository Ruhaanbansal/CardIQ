import React from 'react';
import { Database, Shield, Lock, Calculator } from 'lucide-react';

const indicators = [
  {
    icon: Database,
    title: 'Daily Verified Data',
    description: 'Benefit rules and exclusions are verified daily via automated systems to ensure exact accuracy.',
  },
  {
    icon: Calculator,
    title: 'Deterministic Engine',
    description: 'We don\'t guess. Our calculations parse merchant categories (MCC) and exclusions deterministically.',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'Your data is encrypted. We only analyze transaction categories, never your personal banking details.',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'No data selling. We make money by providing the best optimization tools, not by selling your profile.',
  },
];

export function TrustIndicators() {
  return (
    <section className="py-16 bg-muted/30 border-y">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Why trust CardIQ?</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">We built the infrastructure the credit card industry was missing: transparent, accurate, and completely objective.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {indicators.map((item, index) => (
            <div key={index} className="flex flex-col items-start bg-background p-6 rounded-2xl border shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
