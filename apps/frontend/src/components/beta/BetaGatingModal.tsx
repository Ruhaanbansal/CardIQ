'use client';

import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export function BetaGatingModal({ isBetaApproved }: { isBetaApproved: boolean }) {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  if (isBetaApproved) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode === 'CARDIQ-EARLY') {
      // In production, this would trigger an API call to unlock the account
      window.location.reload();
    } else {
      setError('Invalid invite code. Please try again or join the waitlist.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <Lock className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Private Beta</h2>
        <p className="text-muted-foreground mb-8">
          CardIQ is currently in private beta. Please enter your invite code to access the personalized dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="ENTER INVITE CODE"
              className="w-full text-center tracking-widest uppercase bg-muted border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
            />
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </div>
          
          <Button type="submit" className="w-full">
            Unlock Access <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Don't have a code? <a href="/waitlist" className="text-primary hover:underline font-medium">Join the waitlist</a>
          </p>
        </div>
      </div>
    </div>
  );
}
