import { RecipesService } from './recipes.service';
import { RecipeEntity } from './entities/recipe.entity';
import { RecipeIngredientEntity } from './entities/recipe-ingredient.entity';
import { IngredientEntity } from '../ingredients/entities/ingredient.entity';

describe('RecipesService.computeFoodCost', () => {
  let service: RecipesService;

  beforeEach(() => {
    service = new RecipesService(null as never, null as never);
  });

  function makeRecipe(
    sellingPrice: number,
    portions: number,
    ingredients: Array<{ quantity: number; unitCost: number }>,
  ): RecipeEntity {
    const recipe = new RecipeEntity();
    recipe.sellingPrice = sellingPrice;
    recipe.portions = portions;
    recipe.recipeIngredients = ingredients.map(({ quantity, unitCost }) => {
      const ri = new RecipeIngredientEntity();
      ri.quantity = quantity;
      ri.ingredient = { unitCost } as IngredientEntity;
      return ri;
    });
    return recipe;
  }

  it('calculates food cost per portion correctly', () => {
    // 0.2 kg bœuf × 32€/kg + 0.05 kg beurre × 8€/kg = 6.4 + 0.4 = 6.8€ / 1 portion
    const recipe = makeRecipe(32, 1, [
      { quantity: 0.2, unitCost: 32 },
      { quantity: 0.05, unitCost: 8 },
    ]);
    expect(service.computeFoodCost(recipe)).toBeCloseTo(6.8, 2);
  });

  it('divides by number of portions', () => {
    // total cost = 10€ / 4 portions = 2.5€ per portion
    const recipe = makeRecipe(12, 4, [{ quantity: 1, unitCost: 10 }]);
    expect(service.computeFoodCost(recipe)).toBeCloseTo(2.5, 2);
  });

  it('returns 0 for empty ingredients', () => {
    const recipe = makeRecipe(20, 1, []);
    expect(service.computeFoodCost(recipe)).toBe(0);
  });

  it('handles multi-ingredient recipes correctly', () => {
    // 3 ingredients, 2 portions
    const recipe = makeRecipe(50, 2, [
      { quantity: 0.3, unitCost: 20 },  // 6
      { quantity: 0.1, unitCost: 5 },   // 0.5
      { quantity: 0.2, unitCost: 15 },  // 3
    ]); // total = 9.5, /2 = 4.75
    expect(service.computeFoodCost(recipe)).toBeCloseTo(4.75, 2);
  });
});
