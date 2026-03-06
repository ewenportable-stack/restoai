import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { RecipeIngredientEntity } from './recipe-ingredient.entity';

@Entity('recipes')
export class RecipeEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sellingPrice: number;

  @Column({ type: 'int', default: 1 })
  portions: number;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  establishmentId: string;

  @OneToMany(() => RecipeIngredientEntity, (ri) => ri.recipe, { cascade: true, eager: true })
  recipeIngredients: RecipeIngredientEntity[];
}
