export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  sellingPrice: number;
  portions: number;
  isActive: boolean;
  establishmentId: string;
  ingredients: RecipeIngredient[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

export interface CreateRecipeDto {
  name: string;
  description?: string;
  category: string;
  sellingPrice: number;
  portions: number;
  ingredients: {
    ingredientId: string;
    quantity: number;
  }[];
}
