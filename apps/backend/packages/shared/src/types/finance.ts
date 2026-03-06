export interface RecipeProfitability {
  recipeId: string;
  recipeName: string;
  sellingPrice: number;
  foodCost: number;
  foodCostRatio: number; // 0-1
  grossMargin: number;
  grossMarginRatio: number; // 0-1
}

export interface DashboardStats {
  totalIngredients: number;
  lowStockAlerts: number;
  dlcAlerts: number;
  wastageThisWeek: number; // in €
  avgFoodCostRatio: number;
  topLossRecipe?: RecipeProfitability;
  topProfitRecipe?: RecipeProfitability;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  establishmentId: string;
  totalWastage: number;
  wastageByCategory: Record<string, number>;
  avgFoodCostRatio: number;
  recipeRankings: RecipeProfitability[];
  dlcExpired: number;
  ordersPlaced: number;
  ordersTotal: number;
}

export interface PriceSimulation {
  ingredientId: string;
  ingredientName: string;
  changePercent: number;
  affectedRecipes: {
    recipeId: string;
    recipeName: string;
    currentFoodCost: number;
    newFoodCost: number;
    currentMargin: number;
    newMargin: number;
  }[];
}
