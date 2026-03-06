import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { IngredientRecord } from '../ingredients/ingredients.service';

export interface RecipeIngredientRecord {
  id: string;
  recipeId: string;
  ingredientId: string;
  ingredient: IngredientRecord;
  quantity: number;
}

export interface RecipeRecord {
  id: string;
  name: string;
  description?: string;
  category: string;
  sellingPrice: number;
  portions: number;
  isActive: boolean;
  establishmentId: string;
  createdAt: string;
  recipeIngredients: RecipeIngredientRecord[];
}

function toRecipeIngredient(row: Record<string, unknown>): RecipeIngredientRecord {
  const ing = row['ingredients'] as Record<string, unknown> | null;
  return {
    id: row['id'] as string,
    recipeId: row['recipe_id'] as string,
    ingredientId: row['ingredient_id'] as string,
    ingredient: ing ? {
      id: ing['id'] as string,
      name: ing['name'] as string,
      category: ing['category'] as string,
      unit: ing['unit'] as any,
      unitCost: Number(ing['unit_cost']),
      currentStock: Number(ing['current_stock']),
      reorderThreshold: Number(ing['reorder_threshold']),
      establishmentId: ing['establishment_id'] as string,
      createdAt: ing['created_at'] as string,
    } : {} as IngredientRecord,
    quantity: Number(row['quantity']),
  };
}

function toRecipe(row: Record<string, unknown>, recipeIngredients: RecipeIngredientRecord[]): RecipeRecord {
  return {
    id: row['id'] as string,
    name: row['name'] as string,
    description: row['description'] as string | undefined,
    category: row['category'] as string,
    sellingPrice: Number(row['selling_price']),
    portions: Number(row['portions']),
    isActive: row['is_active'] as boolean,
    establishmentId: row['establishment_id'] as string,
    createdAt: row['created_at'] as string,
    recipeIngredients,
  };
}

@Injectable()
export class RecipesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(establishmentId: string): Promise<RecipeRecord[]> {
    const { data: recipes } = await this.supabase.db
      .from('recipes')
      .select('*')
      .eq('establishment_id', establishmentId)
      .is('deleted_at', null)
      .order('name');

    if (!recipes || recipes.length === 0) return [];

    const recipeIds = recipes.map((r: any) => r.id);
    const { data: ris } = await this.supabase.db
      .from('recipe_ingredients')
      .select('*, ingredients(*)')
      .in('recipe_id', recipeIds);

    const risByRecipe: Record<string, RecipeIngredientRecord[]> = {};
    for (const ri of ris ?? []) {
      const recipeId = ri['recipe_id'] as string;
      if (!risByRecipe[recipeId]) risByRecipe[recipeId] = [];
      risByRecipe[recipeId].push(toRecipeIngredient(ri));
    }

    return recipes.map((r: any) => toRecipe(r, risByRecipe[r.id] ?? []));
  }

  async findOne(id: string, establishmentId: string): Promise<RecipeRecord> {
    const { data } = await this.supabase.db
      .from('recipes')
      .select('*')
      .eq('id', id)
      .eq('establishment_id', establishmentId)
      .is('deleted_at', null)
      .maybeSingle();
    if (!data) throw new NotFoundException('Recette introuvable');

    const { data: ris } = await this.supabase.db
      .from('recipe_ingredients')
      .select('*, ingredients(*)')
      .eq('recipe_id', id);

    return toRecipe(data, (ris ?? []).map(toRecipeIngredient));
  }

  async create(dto: CreateRecipeDto, establishmentId: string): Promise<RecipeRecord> {
    const { data: recipe, error } = await this.supabase.db
      .from('recipes')
      .insert({
        name: dto.name,
        description: dto.description,
        category: dto.category,
        selling_price: dto.sellingPrice,
        portions: dto.portions,
        establishment_id: establishmentId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (dto.ingredients && dto.ingredients.length > 0) {
      await this.supabase.db.from('recipe_ingredients').insert(
        dto.ingredients.map((ing) => ({
          recipe_id: recipe['id'],
          ingredient_id: ing.ingredientId,
          quantity: ing.quantity,
        })),
      );
    }

    return this.findOne(recipe['id'] as string, establishmentId);
  }

  async remove(id: string, establishmentId: string): Promise<void> {
    await this.findOne(id, establishmentId);
    await this.supabase.db
      .from('recipes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('establishment_id', establishmentId);
  }

  computeFoodCost(recipe: RecipeRecord): number {
    const total = recipe.recipeIngredients.reduce(
      (sum, ri) => sum + ri.quantity * Number(ri.ingredient.unitCost),
      0,
    );
    return total / recipe.portions;
  }
}
