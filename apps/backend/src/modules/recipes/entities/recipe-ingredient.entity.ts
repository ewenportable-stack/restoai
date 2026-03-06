import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { RecipeEntity } from './recipe.entity';
import { IngredientEntity } from '../../ingredients/entities/ingredient.entity';

@Entity('recipe_ingredients')
export class RecipeIngredientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipeId: string;

  @ManyToOne(() => RecipeEntity, (r) => r.recipeIngredients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe: RecipeEntity;

  @Column()
  ingredientId: string;

  @ManyToOne(() => IngredientEntity, { eager: true })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: IngredientEntity;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  quantity: number;
}
