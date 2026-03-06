import { api } from './api';
import type { LoginDto, User } from '@chefai/shared';

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  restaurantName: string;
}

export const authService = {
  login: async (dto: LoginDto): Promise<{ accessToken: string; user: User }> => {
    const { data } = await api.post<{ accessToken: string; user: User }>('/auth/login', dto);
    return data;
  },

  register: async (dto: RegisterDto): Promise<{ accessToken: string; user: User }> => {
    const { data } = await api.post<{ accessToken: string; user: User }>('/auth/register', dto);
    return data;
  },
};
