'use client';

import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '../ui/Button';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    // In production, send to backend which routes to Phase 9 Admin Dashboard
    console.log('Feedback submitted:', feedback);
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setFeedback('');
    }, 3000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen ? (
        <div className="bg-card border border-border shadow-2xl rounded-2xl w-80 overflow-hidden mb-4 animate-in slide-in-from-bottom-4">
          <div className="bg-primary/5 px-4 py-3 flex items-center justify-between border-b">
            <h3 className="font-semibold text-sm">Beta Feedback</h3>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            {submitted ? (
              <div className="text-center py-6">
                <p className="text-success font-semibold mb-1">Thank you!</p>
                <p className="text-sm text-muted-foreground">Your feedback helps improve CardIQ.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Found a bug? Have a suggestion?"
                  className="w-full bg-muted border border-border rounded-lg p-3 text-sm min-h-[100px] resize-none focus:ring-1 focus:ring-primary focus:outline-none mb-3"
                />
                <Button type="submit" size="sm" className="w-full" disabled={!feedback.trim()}>
                  Submit
                </Button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
