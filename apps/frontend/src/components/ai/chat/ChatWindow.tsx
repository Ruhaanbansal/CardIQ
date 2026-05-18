'use client';

import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../../stores/chatStore';
import { AIMessage } from './AIMessage';
import { UserMessage } from './UserMessage';
import { StreamingMessage } from './StreamingMessage';
import { useChatStream } from '../../../hooks/api/useChatStream';

export function ChatWindow({ chatId }: { chatId: string }) {
  const messages = useChatStore(state => state.conversations[chatId]?.messages || []);
  const { isStreaming, streamContent } = useChatStream(chatId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamContent]);

  return (
    <div className="absolute inset-0 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth">
      {messages.length === 0 && !isStreaming && (
        <div className="text-center text-muted-foreground mt-20">
          <p className="mb-2">How can I help optimize your spending today?</p>
          <p className="text-xs">Ask me to compare cards, explain recommendations, or find the best card for a specific purchase.</p>
        </div>
      )}

      {messages.map((msg) => (
        msg.role === 'user' 
          ? <UserMessage key={msg.id} content={msg.content} />
          : <AIMessage key={msg.id} content={msg.content} />
      ))}
      
      {isStreaming && <StreamingMessage content={streamContent} />}
      
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
