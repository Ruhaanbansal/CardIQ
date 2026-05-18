'use client';

import { useCallback, useRef, useState } from 'react';

interface StreamChunk {
  delta?: string;
  done?: boolean;
  provider?: string;
  tokensUsed?: number;
  error?: string;
}

interface UseAIStreamResult {
  content: string;
  isStreaming: boolean;
  provider: string | null;
  tokensUsed: number;
  error: string | null;
  startStream: (messages: { role: string; content: string }[]) => void;
  cancel: () => void;
  reset: () => void;
}

export function useAIStream(): UseAIStreamResult {
  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (messages: { role: string; content: string }[]) => {
    setContent('');
    setError(null);
    setIsStreaming(true);
    setTokensUsed(0);

    abortRef.current = new AbortController();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/ai/stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
          signal: abortRef.current.signal,
        },
      );

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const chunk: StreamChunk = JSON.parse(line.slice(6));
            if (chunk.error) { setError(chunk.error); break; }
            if (chunk.done) {
              setTokensUsed(chunk.tokensUsed ?? 0);
              if (chunk.provider) setProvider(chunk.provider);
            } else if (chunk.delta) {
              setContent(prev => prev + chunk.delta);
              if (chunk.provider) setProvider(chunk.provider);
            }
          } catch { /* ignore malformed */ }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message ?? 'Streaming failed');
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setContent('');
    setError(null);
    setProvider(null);
    setTokensUsed(0);
    setIsStreaming(false);
  }, []);

  return { content, isStreaming, provider, tokensUsed, error, startStream, cancel, reset };
}
