'use client';

import React, { useRef, useEffect } from 'react';
import { useAIStore, ChatMessage } from '../../stores/aiStore';
import { useAIStream } from '../../hooks/useAIStream';

// ─── AIProviderIndicator ──────────────────────────────────────────────────────
export function AIProviderIndicator({ provider, isFallback }: { provider?: string; isFallback?: boolean }) {
  if (!provider) return null;
  const colors: Record<string, string> = {
    gemini: 'bg-blue-100 text-blue-700',
    groq: 'bg-orange-100 text-orange-700',
    ollama: 'bg-gray-100 text-gray-600',
    openrouter: 'bg-purple-100 text-purple-700',
    fallback: 'bg-yellow-100 text-yellow-700',
  };
  const style = colors[provider] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {provider.toUpperCase()}{isFallback ? ' (Fallback)' : ''}
    </span>
  );
}

// ─── StreamingMessage ─────────────────────────────────────────────────────────
export function StreamingMessage({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  return (
    <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
      {content}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-0.5 bg-blue-500 animate-pulse rounded-sm" />
      )}
    </div>
  );
}

// ─── AIWarningBanner ──────────────────────────────────────────────────────────
export function AIWarningBanner({ message }: { message: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2 flex gap-2 items-start">
      <span className="shrink-0 text-base">⚠</span>
      <span>{message}</span>
    </div>
  );
}

// ─── AIResponseCard ───────────────────────────────────────────────────────────
export function AIResponseCard({ content, provider, isFallback, tokensUsed }: {
  content: string; provider?: string; isFallback?: boolean; tokensUsed?: number;
}) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">CardIQ AI</span>
        <div className="flex gap-2 items-center">
          {tokensUsed && <span className="text-xs text-gray-400">{tokensUsed} tokens</span>}
          <AIProviderIndicator provider={provider} isFallback={isFallback} />
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
      {isFallback && (
        <AIWarningBanner message="Using backup AI provider for this response." />
      )}
    </div>
  );
}

// ─── ChatWindow ───────────────────────────────────────────────────────────────
export function ChatWindow() {
  const { messages, isLoading, sendMessage, clearConversation } = useAIStore();
  const { content: streamContent, isStreaming, startStream, cancel } = useAIStream();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputRef.current?.value.trim();
    if (!val) return;
    if (inputRef.current) inputRef.current.value = '';
    await sendMessage(val);
  };

  return (
    <div className="flex flex-col h-full border rounded-2xl overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-bold text-white">CardIQ AI Assistant</span>
        </div>
        <button onClick={clearConversation} className="text-xs text-white/60 hover:text-white transition-colors">
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            <p className="text-2xl mb-2">💳</p>
            <p>Ask me anything about your credit cards, rewards, or spending optimization.</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="bg-blue-600 text-white text-sm rounded-2xl rounded-br-sm px-4 py-2 max-w-xs">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-sm">
                <AIResponseCard
                  content={msg.content}
                  provider={msg.provider}
                  isFallback={msg.isFallback}
                  tokensUsed={msg.tokensUsed}
                />
              </div>
            )}
          </div>
        ))}

        {/* Live streaming indicator */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-sm bg-slate-50 border border-slate-200 rounded-xl p-4">
              <StreamingMessage content={streamContent} isStreaming={true} />
            </div>
          </div>
        )}

        {isLoading && !isStreaming && (
          <div className="flex gap-1 px-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask about your cards, rewards, or spending..."
          className="flex-1 text-sm border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isStreaming}
        />
        {isStreaming ? (
          <button type="button" onClick={cancel} className="px-4 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600">
            Stop
          </button>
        ) : (
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50" disabled={isLoading}>
            Send
          </button>
        )}
      </form>
    </div>
  );
}
