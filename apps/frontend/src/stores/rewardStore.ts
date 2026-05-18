import { create } from 'zustand';
import { rewardApi } from '../services/rewardApi';

interface RewardState {
  currentResult: any | null;
  simulationResults: any | null;
  isCalculating: boolean;
  calculateReward: (transactionContext: any) => Promise<void>;
  simulateBatch: (transactions: any[]) => Promise<void>;
  clearResults: () => void;
}

export const useRewardStore = create<RewardState>((set) => ({
  currentResult: null,
  simulationResults: null,
  isCalculating: false,
  
  calculateReward: async (ctx) => {
    set({ isCalculating: true });
    try {
      const result = await rewardApi.calculate(ctx);
      set({ currentResult: result, isCalculating: false });
    } catch (e) {
      console.error(e);
      set({ isCalculating: false, currentResult: null });
    }
  },

  simulateBatch: async (txs) => {
    set({ isCalculating: true });
    try {
      const result = await rewardApi.simulate(txs);
      set({ simulationResults: result, isCalculating: false });
    } catch (e) {
      console.error(e);
      set({ isCalculating: false, simulationResults: null });
    }
  },

  clearResults: () => set({ currentResult: null, simulationResults: null, isCalculating: false })
}));
