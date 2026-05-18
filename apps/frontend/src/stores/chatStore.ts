import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

interface ChatState {
  conversations: Record<string, Conversation>;
  addMessage: (chatId: string, message: Message) => void;
  createConversation: (id: string, title?: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: {},
      
      createConversation: (id, title = 'New Analysis') => set((state) => ({
        conversations: {
          ...state.conversations,
          [id]: { id, title, messages: [], updatedAt: Date.now() }
        }
      })),

      addMessage: (chatId, message) => set((state) => {
        const convo = state.conversations[chatId] || { id: chatId, title: 'New Analysis', messages: [], updatedAt: Date.now() };
        return {
          conversations: {
            ...state.conversations,
            [chatId]: {
              ...convo,
              messages: [...convo.messages, message],
              updatedAt: Date.now()
            }
          }
        };
      })
    }),
    {
      name: 'cardiq-chat-storage',
    }
  )
);
