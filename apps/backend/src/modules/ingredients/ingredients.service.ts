import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { StockUnit } from '@chefai/shared';

export interface IngredientRecord {
  id: string;
  name: string;
  category: string;
  unit: StockUnit;
  unitCost: number;
  currentStock: number;
  reorderThreshold: number;
  establishmentId: string;
  createdAt: string;
}

function toIngredient(row: Record<string, unknown>): IngredientRecord {
  return {
    id: row['id'] as string,
    name: row['name'] as string,
    category: row['category'] as string,
    unit: row['unit'] as StockUnit,
    unitCost: Number(row['unit_cost']),
    currentStock: Number(row['current_stock']),
    reorderThreshold: Number(row['reorder_threshold']),
    establishmentId: row['establishment_id'] as string,
    createdAt: row['created_at'] as string,
  };
}

@Injectable()
export class IngredientsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(establishmentId: string): Promise<IngredientRecord[]> {
    const { data } = await this.supabase.db
      .from('ingredients')
      .select('*')
      .eq('establishment_id', establishmentId)
      .is('deleted_at', null)
      .order('name');
    return (data ?? []).map(toIngredient);
  }

  async findOne(id: string, establishmentId: string): Promise<IngredientRecord> {
    const { data } = await this.supabase.db
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .eq('establishment_id', establishmentId)
      .is('deleted_at', null)
      .maybeSingle();
    if (!data) throw new NotFoundException('Ingrédient introuvable');
    return toIngredient(data);
  }

  async create(dto: CreateIngredientDto, establishmentId: string): Promise<IngredientRecord> {
    const { data, error } = await this.supabase.db
      .from('ingredients')
      .insert({
        name: dto.name,
        category: dto.category,
        unit: dto.unit,
        unit_cost: dto.unitCost ?? 0,
        current_stock: 0,
        reorder_threshold: dto.reorderThreshold ?? 0,
        establishment_id: establishmentId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toIngredient(data);
  }

  async update(
    id: string,
    establishmentId: string,
    dto: Partial<CreateIngredientDto>,
  ): Promise<IngredientRecord> {
    await this.findOne(id, establishmentId);
    const patch: Record<string, unknown> = {};
    if (dto.name !== undefined) patch['name'] = dto.name;
    if (dto.category !== undefined) patch['category'] = dto.category;
    if (dto.unit !== undefined) patch['unit'] = dto.unit;
    if (dto.unitCost !== undefined) patch['unit_cost'] = dto.unitCost;
    if (dto.reorderThreshold !== undefined) patch['reorder_threshold'] = dto.reorderThreshold;

    const { data, error } = await this.supabase.db
      .from('ingredients')
      .update(patch)
      .eq('id', id)
      .eq('establishment_id', establishmentId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toIngredient(data);
  }

  async remove(id: string, establishmentId: string): Promise<void> {
    await this.findOne(id, establishmentId);
    await this.supabase.db
      .from('ingredients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('establishment_id', establishmentId);
  }

  async getLowStockAlerts(establishmentId: string): Promise<IngredientRecord[]> {
    const { data } = await this.supabase.db
      .from('ingredients')
      .select('*')
      .eq('establishment_id', establishmentId)
      .is('deleted_at', null)
      .filter('current_stock', 'lte', 'reorder_threshold');
    // PostgREST column-to-column comparison: use rpc or raw SQL; fallback to in-memory
    const all = await this.findAll(establishmentId);
    return all.filter((i) => i.currentStock <= i.reorderThreshold);
  }

  async updateStock(id: string, quantityDelta: number): Promise<void> {
    // Use RPC for atomic increment
    await this.supabase.db.rpc('increment_stock', {
      ingredient_id: id,
      delta: quantityDelta,
    });
  }
}
