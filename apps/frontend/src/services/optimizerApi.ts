import api from './api';
import { OptimizationRequest, OptimizationResult, BatchOptimizationResult } from '../types/optimizer.types';

export const optimizerApi = {
  suggest: async (request: OptimizationRequest): Promise<OptimizationResult> => {
    const res = await api.post('/optimizer/suggest', request);
    return res.data;
  },

  batch: async (requests: OptimizationRequest[]): Promise<BatchOptimizationResult> => {
    const res = await api.post('/optimizer/batch', requests);
    return res.data;
  },

  alternatives: async (request: OptimizationRequest) => {
    const res = await api.post('/optimizer/alternatives', request);
    return res.data;
  },

  simulate: async (request: OptimizationRequest): Promise<OptimizationResult> => {
    const res = await api.post('/optimizer/simulate', request);
    return res.data;
  },
};
