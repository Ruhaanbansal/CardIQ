'use client';

import React, { useState } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useChatStream } from '../../../hooks/api/useChatStream';

export function MessageComposer({ chatId }: { chatId?: string }) {
  const [input, setInput] = useState('');
  const { sendMessage, isStreaming } = useChatStream(chatId || 'default');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center bg-background border rounded-2xl shadow-sm focus-within:ring-1 focus-within:ring-primary overflow-hidden">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about optimizations, comparisons, or recommendations..."
          className="w-full max-h-32 min-h-[56px] py-4 pl-4 pr-14 bg-transparent border-none resize-none focus:ring-0 text-sm"
          rows={1}
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-2">
          <span className="hidden md:flex items-center text-[10px] text-muted-foreground mr-1">
            <CornerDownLeft className="w-3 h-3 mr-0.5" /> Return
          </span>
          <Button 
            type="submit" 
            size="sm" 
            className="w-10 h-10 rounded-xl p-0"
            disabled={!input.trim() || isStreaming}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
