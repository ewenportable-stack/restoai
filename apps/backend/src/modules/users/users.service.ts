import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@chefai/shared';

export interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  passwordHash: string;
  establishmentId: string;
  createdAt: string;
}

function toUser(row: Record<string, unknown>): UserRecord {
  return {
    id: row['id'] as string,
    email: row['email'] as string,
    firstName: row['first_name'] as string,
    lastName: row['last_name'] as string,
    role: row['role'] as UserRole,
    passwordHash: row['password_hash'] as string,
    establishmentId: row['establishment_id'] as string,
    createdAt: row['created_at'] as string,
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly supabase: SupabaseService) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const { data } = await this.supabase.db
      .from('users')
      .select('*')
      .eq('email', email)
      .is('deleted_at', null)
      .maybeSingle();
    return data ? toUser(data) : null;
  }

  async findById(id: string): Promise<UserRecord> {
    const { data } = await this.supabase.db
      .from('users')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (!data) throw new NotFoundException('Utilisateur introuvable');
    return toUser(data);
  }

  async findByEstablishment(establishmentId: string): Promise<UserRecord[]> {
    const { data } = await this.supabase.db
      .from('users')
      .select('*')
      .eq('establishment_id', establishmentId)
      .is('deleted_at', null);
    return (data ?? []).map(toUser);
  }

  async create(dto: CreateUserDto): Promise<UserRecord> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email déjà utilisé');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const { data, error } = await this.supabase.db
      .from('users')
      .insert({
        email: dto.email,
        first_name: dto.firstName,
        last_name: dto.lastName,
        role: dto.role,
        password_hash: passwordHash,
        establishment_id: dto.establishmentId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toUser(data);
  }

  async createEstablishment(name: string): Promise<{ id: string }> {
    const { data, error } = await this.supabase.db
      .from('establishments')
      .insert({ name, timezone: 'Europe/Paris', plan_tier: 'starter' })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    return data as { id: string };
  }

  async validatePassword(user: UserRecord, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
