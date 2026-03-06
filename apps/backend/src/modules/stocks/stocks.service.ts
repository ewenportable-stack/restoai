import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StockMovementEntity } from './entities/stock-movement.entity';
import { StockLotEntity } from './entities/stock-lot.entity';
import { IngredientsService } from '../ingredients/ingredients.service';
import { CreateStockMovementDto, CreateStockLotDto } from './dto/create-stock-movement.dto';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(StockMovementEntity)
    private readonly movementsRepo: Repository<StockMovementEntity>,
    @InjectRepository(StockLotEntity)
    private readonly lotsRepo: Repository<StockLotEntity>,
    private readonly ingredientsService: IngredientsService,
  ) {}

  async addMovement(dto: CreateStockMovementDto, user: UserEntity) {
    const delta = dto.type === 'in' ? dto.quantity : -dto.quantity;
    const movement = this.movementsRepo.create({
      ...dto,
      userId: user.id,
      establishmentId: user.establishmentId,
    });
    await this.movementsRepo.save(movement);
    await this.ingredientsService.updateStock(dto.ingredientId, delta);
    return movement;
  }

  async addLot(dto: CreateStockLotDto, user: UserEntity) {
    const lot = this.lotsRepo.create({
      ...dto,
      remainingQuantity: dto.quantity,
      establishmentId: user.establishmentId,
    });
    await this.lotsRepo.save(lot);
    // Also record an 'in' movement
    await this.movementsRepo.save(
      this.movementsRepo.create({
        ingredientId: dto.ingredientId,
        type: 'in',
        quantity: dto.quantity,
        reason: `Réception lot ${dto.lotNumber ?? lot.id.slice(0, 8)}`,
        userId: user.id,
        lotId: lot.id,
        establishmentId: user.establishmentId,
      }),
    );
    await this.ingredientsService.updateStock(dto.ingredientId, dto.quantity);
    return lot;
  }

  getMovements(establishmentId: string, ingredientId?: string) {
    const where: Record<string, unknown> = { establishmentId };
    if (ingredientId) where['ingredientId'] = ingredientId;
    return this.movementsRepo.find({
      where,
      relations: ['ingredient'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  getLots(establishmentId: string) {
    return this.lotsRepo.find({
      where: { establishmentId },
      relations: ['ingredient'],
      order: { expiryDate: 'ASC' },
    });
  }

  async getDlcAlerts(establishmentId: string) {
    const now = new Date();
    const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    const lots = await this.lotsRepo.find({
      where: {
        establishmentId,
        expiryDate: LessThanOrEqual(in72h.toISOString().split('T')[0]),
      },
      relations: ['ingredient'],
      order: { expiryDate: 'ASC' },
    });

    return lots
      .filter((lot) => lot.remainingQuantity > 0)
      .map((lot) => {
        const expiry = new Date(lot.expiryDate);
        const daysUntilExpiry = Math.ceil(
          (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
          lot,
          ingredient: lot.ingredient,
          expiryDate: lot.expiryDate,
          daysUntilExpiry,
          severity:
            daysUntilExpiry <= 1 ? 'critical' : daysUntilExpiry <= 2 ? 'warning' : 'info',
        };
      });
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkDlcAlerts() {
    // Scheduled check — in production this would trigger push notifications/emails
    console.log('[StocksService] DLC alert check triggered');
  }
}
