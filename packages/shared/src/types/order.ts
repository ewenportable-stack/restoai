export type OrderStatus = 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  establishmentId: string;
  createdAt: string;
}

export interface Order {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  status: OrderStatus;
  notes?: string;
  lines: OrderLine[];
  total: number;
  establishmentId: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  receivedAt?: string;
}

export interface OrderLine {
  id: string;
  orderId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface CreateOrderDto {
  supplierId: string;
  notes?: string;
  lines: {
    ingredientId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
