import api from './api';
import { SpendingProfile, RecommendationResult } from '../types/recommendation.types';

export const recommendationApi = {
  generate: async (profile: SpendingProfile): Promise<RecommendationResult> => {
    const res = await api.post('/recommendation/generate', profile);
    return res.data;
  },

  getStack: async (profile: SpendingProfile) => {
    const res = await api.post('/recommendation/stack', profile);
    return res.data;
  },

  compare: async (profile: SpendingProfile) => {
    const res = await api.post('/recommendation/compare', profile);
    return res.data;
  },
};
