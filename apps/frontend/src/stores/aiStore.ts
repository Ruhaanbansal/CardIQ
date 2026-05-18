import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { aiApi } from '../services/aiApi';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  tokensUsed?: number;
  isFallback?: boolean;
  timestamp: number;
}

interface AIState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  currentProvider: string | null;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (userContent: string) => Promise<void>;
  clearConversation: () => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      isStreaming: false,
      error: null,
      currentProvider: null,

      addMessage: (msg) => {
        const message: ChatMessage = {
          ...msg,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        set(s => ({ messages: [...s.messages, message] }));
      },

      sendMessage: async (userContent) => {
        const { addMessage, messages } = get();

        // Add user message
        addMessage({ role: 'user', content: userContent });

        set({ isLoading: true, error: null });

        try {
          const history = messages.map(m => ({ role: m.role, content: m.content }));
          const response = await aiApi.chat([
            ...history,
            { role: 'user', content: userContent },
          ]);

          addMessage({
            role: 'assistant',
            content: response.content,
            provider: response.provider,
            tokensUsed: response.tokensUsed,
            isFallback: response.isFallback,
          });

          set({ currentProvider: response.provider });
        } catch (e: any) {
          set({ error: e?.message ?? 'AI unavailable' });
        } finally {
          set({ isLoading: false });
        }
      },

      clearConversation: () => set({ messages: [], error: null, currentProvider: null }),
    }),
    { name: 'cardiq-ai-chat', partialize: (s) => ({ messages: s.messages.slice(-20) }) },
  ),
);
