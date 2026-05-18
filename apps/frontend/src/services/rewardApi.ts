import api from './api';

export const rewardApi = {
  calculate: async (transactionContext: any) => {
    const response = await api.post('/rewards/calculate', { transaction: transactionContext });
    return response.data;
  },

  simulate: async (transactions: any[]) => {
    const response = await api.post('/rewards/simulate', transactions.map(t => ({ transaction: t })));
    return response.data;
  }
};
