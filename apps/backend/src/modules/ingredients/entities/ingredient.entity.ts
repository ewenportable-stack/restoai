import { Column, Entity } from 'typeorm';
import { StockUnit } from '@chefai/shared';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('ingredients')
export class IngredientEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  category: string;

  @Column({ type: 'varchar' })
  unit: StockUnit;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  currentStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  reorderThreshold: number;

  @Column()
  establishmentId: string;
}
