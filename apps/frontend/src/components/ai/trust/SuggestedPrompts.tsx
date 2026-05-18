'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '../../../stores/chatStore';

const prompts = [
  "Which card should I use for Amazon?",
  "Explain my latest recommendation",
  "How can I maximize rewards this month?",
  "Compare HDFC Millennia vs SBI Cashback",
];

export function SuggestedPrompts() {
  const router = useRouter();
  const createConversation = useChatStore(state => state.createConversation);
  const addMessage = useChatStore(state => state.addMessage);

  const handlePromptClick = (prompt: string) => {
    const id = Date.now().toString();
    createConversation(id, prompt.substring(0, 30) + '...');
    
    // We add the user message here so it exists when the chat page loads
    addMessage(id, {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      createdAt: Date.now()
    });
    
    router.push(`/chat/${id}`);
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
      {prompts.map((prompt, i) => (
        <button
          key={i}
          onClick={() => handlePromptClick(prompt)}
          className="px-4 py-2 bg-muted hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-transparent rounded-full text-sm text-foreground/80 transition-colors"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
