export type UserRole = 'admin' | 'chef' | 'manager' | 'server';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  establishmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface Establishment {
  id: string;
  name: string;
  address?: string;
  timezone: string;
  planTier: 'starter' | 'pro' | 'enterprise';
  createdAt: string;
}
