import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';

// Example types based on Phase 4 deterministic engine
interface WalletCard {
  id: string;
  cardName: string;
  bankName: string;
  annualFee: number;
  baseRewardRate: number;
}

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async (): Promise<WalletCard[]> => {
      // Stub API call - would hit GET /api/users/me/wallet
      const { data } = await apiClient.get('/wallet/mock');
      return data;
    },
    // Mock data for initial frontend build before full integration
    initialData: [
      { id: '1', cardName: 'HDFC Millennia', bankName: 'HDFC Bank', annualFee: 1000, baseRewardRate: 1 },
      { id: '2', cardName: 'SBI Cashback', bankName: 'SBI Card', annualFee: 999, baseRewardRate: 5 },
      { id: '3', cardName: 'Axis ATLAS', bankName: 'Axis Bank', annualFee: 5000, baseRewardRate: 2 },
    ]
  });
}
