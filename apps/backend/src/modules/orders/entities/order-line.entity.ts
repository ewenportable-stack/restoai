import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_lines')
export class OrderLineEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => OrderEntity, (o) => o.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column()
  ingredientId: string;

  @Column()
  ingredientName: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity: number;

  @Column()
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;
}
