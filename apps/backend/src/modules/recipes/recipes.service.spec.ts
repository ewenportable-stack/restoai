import { RecipesService } from './recipes.service';
import { RecipeRecord } from './recipes.service';

describe('RecipesService.computeFoodCost', () => {
  let service: RecipesService;

  beforeEach(() => {
    service = new RecipesService(null as never);
  });

  function makeRecipe(
    sellingPrice: number,
    portions: number,
    ingredients: Array<{ quantity: number; unitCost: number }>,
  ): RecipeRecord {
    return {
      id: 'test',
      name: 'Test',
      category: 'Test',
      sellingPrice,
      portions,
      isActive: true,
      establishmentId: 'est1',
      createdAt: new Date().toISOString(),
      recipeIngredients: ingredients.map(({ quantity, unitCost }, i) => ({
        id: `ri-${i}`,
        recipeId: 'test',
        ingredientId: `ing-${i}`,
        quantity,
        ingredient: {
          id: `ing-${i}`,
          name: 'Test',
          category: 'Test',
          unit: 'kg' as any,
          unitCost,
          currentStock: 0,
          reorderThreshold: 0,
          establishmentId: 'est1',
          createdAt: new Date().toISOString(),
        },
      })),
    };
  }

  it('calculates food cost per portion correctly', () => {
    const recipe = makeRecipe(32, 1, [
      { quantity: 0.2, unitCost: 32 },
      { quantity: 0.05, unitCost: 8 },
    ]);
    expect(service.computeFoodCost(recipe)).toBeCloseTo(6.8, 2);
  });

  it('divides by number of portions', () => {
    const recipe = makeRecipe(12, 4, [{ quantity: 1, unitCost: 10 }]);
    expect(service.computeFoodCost(recipe)).toBeCloseTo(2.5, 2);
  });

  it('returns 0 for empty ingredients', () => {
    const recipe = makeRecipe(20, 1, []);
    expect(service.computeFoodCost(recipe)).toBe(0);
  });

  it('handles multi-ingredient recipes correctly', () => {
    const recipe = makeRecipe(50, 2, [
      { quantity: 0.3, unitCost: 20 },
      { quantity: 0.1, unitCost: 5 },
      { quantity: 0.2, unitCost: 15 },
    ]);
    expect(service.computeFoodCost(recipe)).toBeCloseTo(4.75, 2);
  });
});
