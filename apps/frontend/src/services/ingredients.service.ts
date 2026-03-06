import { api } from './api';
import type { Ingredient, CreateIngredientDto } from '@chefai/shared';

export const ingredientsService = {
  getAll: async (): Promise<Ingredient[]> => {
    const { data } = await api.get<Ingredient[]>('/ingredients');
    return data;
  },
  getLowStock: async (): Promise<Ingredient[]> => {
    const { data } = await api.get<Ingredient[]>('/ingredients/alerts/low-stock');
    return data;
  },
  create: async (dto: CreateIngredientDto): Promise<Ingredient> => {
    const { data } = await api.post<Ingredient>('/ingredients', dto);
    return data;
  },
  update: async (id: string, dto: Partial<CreateIngredientDto>): Promise<Ingredient> => {
    const { data } = await api.patch<Ingredient>(`/ingredients/${id}`, dto);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/ingredients/${id}`);
  },
};
