import { create } from 'zustand';
import { optimizerApi } from '../services/optimizerApi';
import { OptimizationRequest, OptimizationResult, BatchOptimizationResult } from '../types/optimizer.types';

interface OptimizerState {
  result: OptimizationResult | null;
  batchResult: BatchOptimizationResult | null;
  isLoading: boolean;
  error: string | null;
  suggest: (request: OptimizationRequest) => Promise<void>;
  runBatch: (requests: OptimizationRequest[]) => Promise<void>;
  clear: () => void;
}

export const useOptimizerStore = create<OptimizerState>((set) => ({
  result: null,
  batchResult: null,
  isLoading: false,
  error: null,

  suggest: async (request) => {
    set({ isLoading: true, error: null, result: null });
    try {
      const result = await optimizerApi.suggest(request);
      set({ result, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Optimization failed', isLoading: false });
    }
  },

  runBatch: async (requests) => {
    set({ isLoading: true, error: null, batchResult: null });
    try {
      const batchResult = await optimizerApi.batch(requests);
      set({ batchResult, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Batch optimization failed', isLoading: false });
    }
  },

  clear: () => set({ result: null, batchResult: null, error: null, isLoading: false }),
}));
