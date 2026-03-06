import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { IngredientEntity } from '../../ingredients/entities/ingredient.entity';

@Entity('stock_lots')
export class StockLotEntity extends BaseEntity {
  @Column()
  ingredientId: string;

  @ManyToOne(() => IngredientEntity)
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: IngredientEntity;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  remainingQuantity: number;

  @Column({ type: 'date' })
  expiryDate: string;

  @Column({ nullable: true })
  supplierId?: string;

  @Column({ nullable: true })
  lotNumber?: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  receivedAt: Date;

  @Column()
  establishmentId: string;
}
