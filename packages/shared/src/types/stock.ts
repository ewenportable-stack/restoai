export type StockUnit = 'kg' | 'g' | 'l' | 'ml' | 'unit' | 'portion';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: StockUnit;
  unitCost: number;
  currentStock: number;
  reorderThreshold: number;
  establishmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockLot {
  id: string;
  ingredientId: string;
  ingredient?: Ingredient;
  quantity: number;
  expiryDate: string;
  supplierId?: string;
  lotNumber?: string;
  receivedAt: string;
  remainingQuantity: number;
}

export interface StockMovement {
  id: string;
  ingredientId: string;
  ingredient?: Ingredient;
  type: 'in' | 'out' | 'adjustment' | 'waste';
  quantity: number;
  reason?: string;
  userId: string;
  lotId?: string;
  createdAt: string;
}

export interface DlcAlert {
  id: string;
  lot: StockLot;
  ingredient: Ingredient;
  expiryDate: string;
  daysUntilExpiry: number;
  severity: AlertSeverity;
  acknowledgedAt?: string;
}

export interface StockAlert {
  ingredientId: string;
  ingredient: Ingredient;
  currentStock: number;
  threshold: number;
  severity: AlertSeverity;
}

export interface CreateIngredientDto {
  name: string;
  category: string;
  unit: StockUnit;
  unitCost: number;
  reorderThreshold: number;
}

export interface CreateStockMovementDto {
  ingredientId: string;
  type: StockMovement['type'];
  quantity: number;
  reason?: string;
  lotId?: string;
}

export interface CreateStockLotDto {
  ingredientId: string;
  quantity: number;
  expiryDate: string;
  supplierId?: string;
  lotNumber?: string;
}
