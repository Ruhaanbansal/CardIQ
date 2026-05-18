import { create } from 'zustand';
import { recommendationApi } from '../services/recommendationApi';
import { SpendingProfile, RecommendationResult } from '../types/recommendation.types';

interface RecommendationState {
  result: RecommendationResult | null;
  isLoading: boolean;
  error: string | null;
  generate: (profile: SpendingProfile) => Promise<void>;
  clear: () => void;
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  result: null,
  isLoading: false,
  error: null,

  generate: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      const result = await recommendationApi.generate(profile);
      set({ result, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to generate recommendations', isLoading: false });
    }
  },

  clear: () => set({ result: null, error: null, isLoading: false }),
}));
