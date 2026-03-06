import { api } from './api';
import type { DashboardStats, RecipeProfitability, PriceSimulation } from '@chefai/shared';

export const financeService = {
  getDashboard: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/finance/dashboard');
    return data;
  },
  getProfitability: async (): Promise<RecipeProfitability[]> => {
    const { data } = await api.get<RecipeProfitability[]>('/finance/profitability');
    return data;
  },
  simulate: async (ingredientId: string, changePercent: number): Promise<PriceSimulation> => {
    const { data } = await api.get<PriceSimulation>('/finance/simulate', {
      params: { ingredientId, changePercent },
    });
    return data;
  },
};
