import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const aiApi = {
  chat: async (messages: { role: string; content: string }[]) => {
    const res = await axios.post(`${API_BASE}/ai/chat`, { messages });
    return res.data;
  },

  optimizerExplanation: async (context: any, userMessage?: string) => {
    const res = await axios.post(`${API_BASE}/ai/optimizer-explanation`, { context, userMessage });
    return res.data;
  },

  recommendSummary: async (context: any, userMessage?: string) => {
    const res = await axios.post(`${API_BASE}/ai/recommend-summary`, { context, userMessage });
    return res.data;
  },

  embed: async (text: string) => {
    const res = await axios.post(`${API_BASE}/ai/embed`, { text });
    return res.data;
  },

  search: async (query: string, topK = 5) => {
    const res = await axios.post(`${API_BASE}/ai/search`, { query, topK });
    return res.data;
  },

  getProviderHealth: async () => {
    const res = await axios.get(`${API_BASE}/ai/provider-health`);
    return res.data;
  },

  getTokenUsage: async () => {
    const res = await axios.get(`${API_BASE}/ai/token-usage`);
    return res.data;
  },
};
