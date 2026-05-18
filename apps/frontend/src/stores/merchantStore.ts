import { create } from 'zustand';
import { merchantApi, MerchantSearchResult } from '../services/merchantApi';

interface MerchantState {
  searchResults: MerchantSearchResult[];
  isSearching: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useMerchantStore = create<MerchantState>((set) => ({
  searchResults: [],
  isSearching: false,
  searchQuery: '',
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  performSearch: async (query) => {
    if (!query || query.length < 2) {
      set({ searchResults: [], isSearching: false });
      return;
    }
    
    set({ isSearching: true });
    try {
      const results = await merchantApi.search(query);
      set({ searchResults: results, isSearching: false });
    } catch (error) {
      console.error('Merchant search failed', error);
      set({ searchResults: [], isSearching: false });
    }
  },
  
  clearSearch: () => set({ searchResults: [], searchQuery: '', isSearching: false }),
}));
