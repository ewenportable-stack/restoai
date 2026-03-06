import { Injectable } from '@nestjs/common';
import { RecipesService } from '../recipes/recipes.service';
import { IngredientsService } from '../ingredients/ingredients.service';
import { StocksService } from '../stocks/stocks.service';
import { RecipeProfitability } from '@chefai/shared';

@Injectable()
export class FinanceService {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly ingredientsService: IngredientsService,
    private readonly stocksService: StocksService,
  ) {}

  async getRecipeProfitability(establishmentId: string): Promise<RecipeProfitability[]> {
    const recipes = await this.recipesService.findAll(establishmentId);

    return recipes.map((recipe) => {
      const foodCost = this.recipesService.computeFoodCost(recipe);
      const sellingPrice = Number(recipe.sellingPrice);
      const grossMargin = sellingPrice - foodCost;
      return {
        recipeId: recipe.id,
        recipeName: recipe.name,
        sellingPrice,
        foodCost: Math.round(foodCost * 100) / 100,
        foodCostRatio: sellingPrice > 0 ? foodCost / sellingPrice : 0,
        grossMargin: Math.round(grossMargin * 100) / 100,
        grossMarginRatio: sellingPrice > 0 ? grossMargin / sellingPrice : 0,
      };
    });
  }

  async getDashboardStats(establishmentId: string) {
    const [ingredients, lowStock, dlcAlerts, profitability] = await Promise.all([
      this.ingredientsService.findAll(establishmentId),
      this.ingredientsService.getLowStockAlerts(establishmentId),
      this.stocksService.getDlcAlerts(establishmentId),
      this.getRecipeProfitability(establishmentId),
    ]);

    const avgFoodCostRatio =
      profitability.length > 0
        ? profitability.reduce((sum, r) => sum + r.foodCostRatio, 0) / profitability.length
        : 0;

    const sorted = [...profitability].sort((a, b) => b.grossMarginRatio - a.grossMarginRatio);

    return {
      totalIngredients: ingredients.length,
      lowStockAlerts: lowStock.length,
      dlcAlerts: dlcAlerts.length,
      avgFoodCostRatio: Math.round(avgFoodCostRatio * 1000) / 10, // as percentage
      topProfitRecipe: sorted[0] ?? null,
      topLossRecipe: sorted[sorted.length - 1] ?? null,
    };
  }

  async simulatePriceChange(
    ingredientId: string,
    changePercent: number,
    establishmentId: string,
  ) {
    const ingredient = await this.ingredientsService.findOne(ingredientId, establishmentId);
    const recipes = await this.recipesService.findAll(establishmentId);

    const affectedRecipes = recipes
      .filter((r) => r.recipeIngredients.some((ri) => ri.ingredientId === ingredientId))
      .map((recipe) => {
        const currentFoodCost = this.recipesService.computeFoodCost(recipe);
        const sellingPrice = Number(recipe.sellingPrice);

        // Recalculate with price change
        const multiplier = 1 + changePercent / 100;
        const newFoodCost =
          recipe.recipeIngredients.reduce((sum, ri) => {
            const cost =
              ri.ingredientId === ingredientId
                ? ri.quantity * Number(ri.ingredient.unitCost) * multiplier
                : ri.quantity * Number(ri.ingredient.unitCost);
            return sum + cost;
          }, 0) / recipe.portions;

        return {
          recipeId: recipe.id,
          recipeName: recipe.name,
          currentFoodCost: Math.round(currentFoodCost * 100) / 100,
          newFoodCost: Math.round(newFoodCost * 100) / 100,
          currentMargin: Math.round((sellingPrice - currentFoodCost) * 100) / 100,
          newMargin: Math.round((sellingPrice - newFoodCost) * 100) / 100,
        };
      });

    return {
      ingredientId,
      ingredientName: ingredient.name,
      changePercent,
      affectedRecipes,
    };
  }
}
