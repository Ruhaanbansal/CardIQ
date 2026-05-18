import { create } from 'zustand';

interface WalletState {
  searchQuery: string;
  sortBy: 'fee' | 'rewardRate' | 'name';
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'fee' | 'rewardRate' | 'name') => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  searchQuery: '',
  sortBy: 'name',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
}));
