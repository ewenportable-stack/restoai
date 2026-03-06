import { api } from './api';
import type { StockMovement, StockLot, DlcAlert, CreateStockMovementDto, CreateStockLotDto } from '@chefai/shared';

export const stocksService = {
  getMovements: async (ingredientId?: string): Promise<StockMovement[]> => {
    const { data } = await api.get<StockMovement[]>('/stocks/movements', {
      params: ingredientId ? { ingredientId } : undefined,
    });
    return data;
  },
  getLots: async (): Promise<StockLot[]> => {
    const { data } = await api.get<StockLot[]>('/stocks/lots');
    return data;
  },
  getDlcAlerts: async (): Promise<DlcAlert[]> => {
    const { data } = await api.get<DlcAlert[]>('/stocks/alerts/dlc');
    return data;
  },
  addMovement: async (dto: CreateStockMovementDto): Promise<StockMovement> => {
    const { data } = await api.post<StockMovement>('/stocks/movements', dto);
    return data;
  },
  addLot: async (dto: CreateStockLotDto): Promise<StockLot> => {
    const { data } = await api.post<StockLot>('/stocks/lots', dto);
    return data;
  },
};
