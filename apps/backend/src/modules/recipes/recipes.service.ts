import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipeEntity } from './entities/recipe.entity';
import { RecipeIngredientEntity } from './entities/recipe-ingredient.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipesRepo: Repository<RecipeEntity>,
    @InjectRepository(RecipeIngredientEntity)
    private readonly recipeIngredientsRepo: Repository<RecipeIngredientEntity>,
  ) {}

  findAll(establishmentId: string) {
    return this.recipesRepo.find({
      where: { establishmentId },
      relations: ['recipeIngredients', 'recipeIngredients.ingredient'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, establishmentId: string) {
    const recipe = await this.recipesRepo.findOne({
      where: { id, establishmentId },
      relations: ['recipeIngredients', 'recipeIngredients.ingredient'],
    });
    if (!recipe) throw new NotFoundException('Recette introuvable');
    return recipe;
  }

  async create(dto: CreateRecipeDto, establishmentId: string) {
    const recipe = this.recipesRepo.create({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      sellingPrice: dto.sellingPrice,
      portions: dto.portions,
      establishmentId,
    });
    const saved = await this.recipesRepo.save(recipe);

    const lines = dto.ingredients.map((ing) =>
      this.recipeIngredientsRepo.create({
        recipeId: saved.id,
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
      }),
    );
    await this.recipeIngredientsRepo.save(lines);
    return this.findOne(saved.id, establishmentId);
  }

  async remove(id: string, establishmentId: string) {
    const recipe = await this.findOne(id, establishmentId);
    return this.recipesRepo.softRemove(recipe);
  }

  /**
   * Food cost = Σ(quantity × ingredient.unitCost) / portions
   */
  computeFoodCost(recipe: RecipeEntity): number {
    const totalIngredientCost = recipe.recipeIngredients.reduce((sum, ri) => {
      return sum + ri.quantity * Number(ri.ingredient.unitCost);
    }, 0);
    return totalIngredientCost / recipe.portions;
  }
}
