import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { IngredientEntity } from '../../ingredients/entities/ingredient.entity';

export type MovementType = 'in' | 'out' | 'adjustment' | 'waste';

@Entity('stock_movements')
export class StockMovementEntity extends BaseEntity {
  @Column()
  ingredientId: string;

  @ManyToOne(() => IngredientEntity)
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: IngredientEntity;

  @Column({ type: 'varchar' })
  type: MovementType;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity: number;

  @Column({ nullable: true })
  reason?: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  lotId?: string;

  @Column()
  establishmentId: string;
}
