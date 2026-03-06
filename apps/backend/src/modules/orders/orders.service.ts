import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { IngredientsService } from '../ingredients/ingredients.service';
import { UserRecord } from '../users/users.service';

export class CreateOrderDto {
  supplierId: string;
  notes?: string;
  lines: { ingredientId: string; quantity: number; unitPrice: number }[];
}

export type OrderStatus = 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';

export interface OrderLineRecord {
  id: string;
  orderId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface OrderRecord {
  id: string;
  supplierId: string;
  status: OrderStatus;
  notes?: string;
  total: number;
  establishmentId: string;
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
  lines: OrderLineRecord[];
}

function toOrderLine(row: Record<string, unknown>): OrderLineRecord {
  return {
    id: row['id'] as string,
    orderId: row['order_id'] as string,
    ingredientId: row['ingredient_id'] as string,
    ingredientName: row['ingredient_name'] as string,
    quantity: Number(row['quantity']),
    unit: row['unit'] as string,
    unitPrice: Number(row['unit_price']),
    total: Number(row['total']),
  };
}

function toOrder(row: Record<string, unknown>, lines: OrderLineRecord[]): OrderRecord {
  return {
    id: row['id'] as string,
    supplierId: row['supplier_id'] as string,
    status: row['status'] as OrderStatus,
    notes: row['notes'] as string | undefined,
    total: Number(row['total']),
    establishmentId: row['establishment_id'] as string,
    sentAt: row['sent_at'] as string | undefined,
    receivedAt: row['received_at'] as string | undefined,
    createdAt: row['created_at'] as string,
    lines,
  };
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly ingredientsService: IngredientsService,
  ) {}

  async findAll(establishmentId: string): Promise<OrderRecord[]> {
    const { data: orders } = await this.supabase.db
      .from('orders')
      .select('*')
      .eq('establishment_id', establishmentId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (!orders || orders.length === 0) return [];

    const orderIds = orders.map((o: any) => o.id);
    const { data: lines } = await this.supabase.db
      .from('order_lines')
      .select('*')
      .in('order_id', orderIds);

    const linesByOrder: Record<string, OrderLineRecord[]> = {};
    for (const l of lines ?? []) {
      const orderId = l['order_id'] as string;
      if (!linesByOrder[orderId]) linesByOrder[orderId] = [];
      linesByOrder[orderId].push(toOrderLine(l));
    }

    return orders.map((o: any) => toOrder(o, linesByOrder[o.id] ?? []));
  }

  async findOne(id: string, establishmentId: string): Promise<OrderRecord> {
    const { data } = await this.supabase.db
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('establishment_id', establishmentId)
      .is('deleted_at', null)
      .maybeSingle();
    if (!data) throw new NotFoundException('Commande introuvable');

    const { data: lines } = await this.supabase.db
      .from('order_lines')
      .select('*')
      .eq('order_id', id);

    return toOrder(data, (lines ?? []).map(toOrderLine));
  }

  async create(dto: CreateOrderDto, user: UserRecord): Promise<OrderRecord> {
    let total = 0;
    const lineData: Array<{
      ingredient_id: string;
      ingredient_name: string;
      quantity: number;
      unit: string;
      unit_price: number;
      total: number;
    }> = [];

    for (const line of dto.lines) {
      const ingredient = await this.ingredientsService.findOne(line.ingredientId, user.establishmentId);
      const lineTotal = line.quantity * line.unitPrice;
      total += lineTotal;
      lineData.push({
        ingredient_id: line.ingredientId,
        ingredient_name: ingredient.name,
        quantity: line.quantity,
        unit: ingredient.unit,
        unit_price: line.unitPrice,
        total: lineTotal,
      });
    }

    const { data: order, error } = await this.supabase.db
      .from('orders')
      .insert({
        supplier_id: dto.supplierId,
        notes: dto.notes,
        total,
        establishment_id: user.establishmentId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await this.supabase.db.from('order_lines').insert(
      lineData.map((l) => ({ ...l, order_id: order['id'] })),
    );

    return this.findOne(order['id'] as string, user.establishmentId);
  }

  async updateStatus(id: string, status: OrderStatus, user: UserRecord): Promise<OrderRecord> {
    const order = await this.findOne(id, user.establishmentId);
    const validTransitions: Record<string, string[]> = {
      draft: ['sent', 'cancelled'],
      sent: ['confirmed', 'cancelled'],
      confirmed: ['received', 'cancelled'],
      received: [],
      cancelled: [],
    };
    if (!validTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(`Transition invalide: ${order.status} -> ${status}`);
    }

    const patch: Record<string, unknown> = { status };
    if (status === 'sent') patch['sent_at'] = new Date().toISOString();
    if (status === 'received') patch['received_at'] = new Date().toISOString();

    await this.supabase.db
      .from('orders')
      .update(patch)
      .eq('id', id)
      .eq('establishment_id', user.establishmentId);

    return this.findOne(id, user.establishmentId);
  }
}
