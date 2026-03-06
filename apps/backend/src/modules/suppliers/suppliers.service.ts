import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export class CreateSupplierDto {
  name: string;
  email?: string;
  phone?: string;
}

export interface SupplierRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  establishmentId: string;
  createdAt: string;
}

function toSupplier(row: Record<string, unknown>): SupplierRecord {
  return {
    id: row['id'] as string,
    name: row['name'] as string,
    email: row['email'] as string | undefined,
    phone: row['phone'] as string | undefined,
    establishmentId: row['establishment_id'] as string,
    createdAt: row['created_at'] as string,
  };
}

@Injectable()
export class SuppliersService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(establishmentId: string): Promise<SupplierRecord[]> {
    const { data } = await this.supabase.db
      .from('suppliers')
      .select('*')
      .eq('establishment_id', establishmentId)
      .is('deleted_at', null)
      .order('name');
    return (data ?? []).map(toSupplier);
  }

  async findOne(id: string, establishmentId: string): Promise<SupplierRecord> {
    const { data } = await this.supabase.db
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .eq('establishment_id', establishmentId)
      .is('deleted_at', null)
      .maybeSingle();
    if (!data) throw new NotFoundException('Fournisseur introuvable');
    return toSupplier(data);
  }

  async create(dto: CreateSupplierDto, establishmentId: string): Promise<SupplierRecord> {
    const { data, error } = await this.supabase.db
      .from('suppliers')
      .insert({ name: dto.name, email: dto.email, phone: dto.phone, establishment_id: establishmentId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toSupplier(data);
  }
}
