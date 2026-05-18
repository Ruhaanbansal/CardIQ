import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

interface OptimizeRequest {
  merchantName: string;
  amount: number;
}

export function useOptimizer() {
  return useMutation({
    mutationFn: async (req: OptimizeRequest) => {
      // Hits the Phase 6 Real-time Optimizer Engine
      const { data } = await apiClient.post('/optimizer/evaluate', req);
      return data;
    }
  });
}
