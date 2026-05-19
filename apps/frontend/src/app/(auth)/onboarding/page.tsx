'use client';

import React, { useEffect } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Forms';

// Force dynamic rendering to bypass Next.js 15.3.x static prerender bug
export const dynamic = 'force-dynamic';


export default function OnboardingPage() {
  const { step, nextStep, prevStep, spendProfile, updateSpendProfile } = useOnboardingStore();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch on persisted store

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl p-8">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold mb-2">How much do you spend?</h2>
            <p className="text-muted-foreground mb-6">This helps us calculate your exact rewards.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Monthly Spend (₹)</label>
                <Input 
                  type="number" 
                  value={spendProfile.monthlySpend}
                  onChange={(e) => updateSpendProfile({ monthlySpend: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            <Button className="w-full mt-8" onClick={nextStep}>Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold mb-2">What's your priority?</h2>
            <p className="text-muted-foreground mb-6">Choose what you value more.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex flex-col" onClick={nextStep}>
                <span className="text-2xl mb-2">✈️</span>
                <span>Travel / Miles</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col" onClick={nextStep}>
                <span className="text-2xl mb-2">💰</span>
                <span>Cashback</span>
              </Button>
            </div>
            <Button variant="ghost" className="w-full mt-4" onClick={prevStep}>Back</Button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
            <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold mb-2">Profile Complete!</h2>
            <p className="text-muted-foreground mb-8">We're ready to optimize your spending.</p>
            
            <Button className="w-full">Create Account</Button>
            <Button variant="ghost" className="w-full mt-2" onClick={prevStep}>Back</Button>
          </div>
        )}

      </div>
    </div>
  );
}
