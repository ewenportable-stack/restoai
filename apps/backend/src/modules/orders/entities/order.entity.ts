import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { OrderLineEntity } from './order-line.entity';

export type OrderStatus = 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @Column()
  supplierId: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: OrderStatus;

  @Column({ nullable: true })
  notes?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column()
  establishmentId: string;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  receivedAt?: Date;

  @OneToMany(() => OrderLineEntity, (l) => l.order, { cascade: true, eager: true })
  lines: OrderLineEntity[];
}
