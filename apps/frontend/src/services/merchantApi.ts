import api from './api';

export interface MerchantSearchResult {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
  confidenceScore: number;
}

export const merchantApi = {
  search: async (query: string): Promise<MerchantSearchResult[]> => {
    if (!query || query.length < 2) return [];
    const response = await api.get('/merchants/search', { params: { q: query } });
    return response.data;
  },

  resolve: async (narration: string, mccHint?: string) => {
    const response = await api.post('/merchants/resolve', { narration, mccHint });
    return response.data;
  }
};
