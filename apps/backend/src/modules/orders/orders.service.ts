import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderLineEntity } from './entities/order-line.entity';
import { IngredientsService } from '../ingredients/ingredients.service';
import { UserEntity } from '../users/entities/user.entity';

export class CreateOrderDto {
  supplierId: string;
  notes?: string;
  lines: { ingredientId: string; quantity: number; unitPrice: number }[];
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepo: Repository<OrderEntity>,
    @InjectRepository(OrderLineEntity)
    private readonly linesRepo: Repository<OrderLineEntity>,
    private readonly ingredientsService: IngredientsService,
  ) {}

  findAll(establishmentId: string) {
    return this.ordersRepo.find({
      where: { establishmentId },
      relations: ['lines'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, establishmentId: string) {
    const order = await this.ordersRepo.findOne({
      where: { id, establishmentId },
      relations: ['lines'],
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }

  async create(dto: CreateOrderDto, user: UserEntity) {
    let total = 0;
    const lineEntities: Partial<OrderLineEntity>[] = [];

    for (const line of dto.lines) {
      const ingredient = await this.ingredientsService.findOne(
        line.ingredientId,
        user.establishmentId,
      );
      const lineTotal = line.quantity * line.unitPrice;
      total += lineTotal;
      lineEntities.push({
        ingredientId: line.ingredientId,
        ingredientName: ingredient.name,
        quantity: line.quantity,
        unit: ingredient.unit,
        unitPrice: line.unitPrice,
        total: lineTotal,
      });
    }

    const order = this.ordersRepo.create({
      supplierId: dto.supplierId,
      notes: dto.notes,
      total,
      establishmentId: user.establishmentId,
    });
    const saved = await this.ordersRepo.save(order);

    await this.linesRepo.save(lineEntities.map((l) => ({ ...l, orderId: saved.id })));
    return this.findOne(saved.id, user.establishmentId);
  }

  async updateStatus(id: string, status: OrderEntity['status'], user: UserEntity) {
    const order = await this.findOne(id, user.establishmentId);
    const validTransitions: Record<string, string[]> = {
      draft: ['sent', 'cancelled'],
      sent: ['confirmed', 'cancelled'],
      confirmed: ['received', 'cancelled'],
      received: [],
      cancelled: [],
    };
    if (!validTransitions[order.status]?.includes(status)) {
      throw new BadRequestException(
        `Transition invalide: ${order.status} -> ${status}`,
      );
    }
    order.status = status;
    if (status === 'sent') order.sentAt = new Date();
    if (status === 'received') order.receivedAt = new Date();
    return this.ordersRepo.save(order);
  }
}
