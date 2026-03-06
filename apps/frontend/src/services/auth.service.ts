import { api } from './api';
import type { LoginDto, User } from '@chefai/shared';

export const authService = {
  login: async (dto: LoginDto): Promise<{ accessToken: string; user: User }> => {
    const { data } = await api.post<{ accessToken: string; user: User }>('/auth/login', dto);
    return data;
  },
};
