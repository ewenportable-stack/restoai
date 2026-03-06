import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';
import { IngredientsService, IngredientRecord } from '../ingredients/ingredients.service';
import { CreateStockMovementDto, CreateStockLotDto } from './dto/create-stock-movement.dto';
import { UserRecord } from '../users/users.service';

export interface StockMovementRecord {
  id: string;
  ingredientId: string;
  ingredient?: IngredientRecord;
  type: 'in' | 'out' | 'adjustment' | 'waste';
  quantity: number;
  reason?: string;
  userId: string;
  lotId?: string;
  establishmentId: string;
  createdAt: string;
}

export interface StockLotRecord {
  id: string;
  ingredientId: string;
  ingredient?: IngredientRecord;
  quantity: number;
  remainingQuantity: number;
  expiryDate: string;
  supplierId?: string;
  lotNumber?: string;
  receivedAt: string;
  establishmentId: string;
  createdAt: string;
}

function toMovement(row: Record<string, unknown>): StockMovementRecord {
  const ingredient = row['ingredients'] as Record<string, unknown> | null;
  return {
    id: row['id'] as string,
    ingredientId: row['ingredient_id'] as string,
    ingredient: ingredient ? {
      id: ingredient['id'] as string,
      name: ingredient['name'] as string,
      category: ingredient['category'] as string,
      unit: ingredient['unit'] as any,
      unitCost: Number(ingredient['unit_cost']),
      currentStock: Number(ingredient['current_stock']),
      reorderThreshold: Number(ingredient['reorder_threshold']),
      establishmentId: ingredient['establishment_id'] as string,
      createdAt: ingredient['created_at'] as string,
    } : undefined,
    type: row['type'] as any,
    quantity: Number(row['quantity']),
    reason: row['reason'] as string | undefined,
    userId: row['user_id'] as string,
    lotId: row['lot_id'] as string | undefined,
    establishmentId: row['establishment_id'] as string,
    createdAt: row['created_at'] as string,
  };
}

function toLot(row: Record<string, unknown>): StockLotRecord {
  const ingredient = row['ingredients'] as Record<string, unknown> | null;
  return {
    id: row['id'] as string,
    ingredientId: row['ingredient_id'] as string,
    ingredient: ingredient ? {
      id: ingredient['id'] as string,
      name: ingredient['name'] as string,
      category: ingredient['category'] as string,
      unit: ingredient['unit'] as any,
      unitCost: Number(ingredient['unit_cost']),
      currentStock: Number(ingredient['current_stock']),
      reorderThreshold: Number(ingredient['reorder_threshold']),
      establishmentId: ingredient['establishment_id'] as string,
      createdAt: ingredient['created_at'] as string,
    } : undefined,
    quantity: Number(row['quantity']),
    remainingQuantity: Number(row['remaining_quantity']),
    expiryDate: row['expiry_date'] as string,
    supplierId: row['supplier_id'] as string | undefined,
    lotNumber: row['lot_number'] as string | undefined,
    receivedAt: row['received_at'] as string,
    establishmentId: row['establishment_id'] as string,
    createdAt: row['created_at'] as string,
  };
}

@Injectable()
export class StocksService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly ingredientsService: IngredientsService,
  ) {}

  async addMovement(dto: CreateStockMovementDto, user: UserRecord) {
    const delta = dto.type === 'in' ? dto.quantity : -dto.quantity;
    const { data, error } = await this.supabase.db
      .from('stock_movements')
      .insert({
        ingredient_id: dto.ingredientId,
        type: dto.type,
        quantity: dto.quantity,
        reason: dto.reason,
        user_id: user.id,
        lot_id: (dto as any).lotId,
        establishment_id: user.establishmentId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await this.ingredientsService.updateStock(dto.ingredientId, delta);
    return toMovement(data);
  }

  async addLot(dto: CreateStockLotDto, user: UserRecord) {
    const { data: lotData, error: lotError } = await this.supabase.db
      .from('stock_lots')
      .insert({
        ingredient_id: dto.ingredientId,
        quantity: dto.quantity,
        remaining_quantity: dto.quantity,
        expiry_date: dto.expiryDate,
        supplier_id: dto.supplierId,
        lot_number: dto.lotNumber,
        establishment_id: user.establishmentId,
      })
      .select()
      .single();
    if (lotError) throw new Error(lotError.message);

    const lot = toLot(lotData);
    await this.supabase.db.from('stock_movements').insert({
      ingredient_id: dto.ingredientId,
      type: 'in',
      quantity: dto.quantity,
      reason: `Réception lot ${dto.lotNumber ?? lot.id.slice(0, 8)}`,
      user_id: user.id,
      lot_id: lot.id,
      establishment_id: user.establishmentId,
    });
    await this.ingredientsService.updateStock(dto.ingredientId, dto.quantity);
    return lot;
  }

  async getMovements(establishmentId: string, ingredientId?: string) {
    let query = this.supabase.db
      .from('stock_movements')
      .select('*, ingredients(*)')
      .eq('establishment_id', establishmentId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (ingredientId) query = query.eq('ingredient_id', ingredientId);

    const { data } = await query;
    return (data ?? []).map(toMovement);
  }

  async getLots(establishmentId: string) {
    const { data } = await this.supabase.db
      .from('stock_lots')
      .select('*, ingredients(*)')
      .eq('establishment_id', establishmentId)
      .order('expiry_date');
    return (data ?? []).map(toLot);
  }

  async getDlcAlerts(establishmentId: string) {
    const now = new Date();
    const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const { data } = await this.supabase.db
      .from('stock_lots')
      .select('*, ingredients(*)')
      .eq('establishment_id', establishmentId)
      .lte('expiry_date', in72h.toISOString().split('T')[0])
      .order('expiry_date');

    return (data ?? [])
      .map(toLot)
      .filter((lot) => lot.remainingQuantity > 0)
      .map((lot) => {
        const expiry = new Date(lot.expiryDate);
        const daysUntilExpiry = Math.ceil(
          (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
          lot,
          ingredient: lot.ingredient,
          expiryDate: lot.expiryDate,
          daysUntilExpiry,
          severity: daysUntilExpiry <= 1 ? 'critical' : daysUntilExpiry <= 2 ? 'warning' : 'info',
        };
      });
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkDlcAlerts() {
    console.log('[StocksService] DLC alert check triggered');
  }
}
