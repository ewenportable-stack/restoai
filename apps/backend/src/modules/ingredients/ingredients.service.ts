import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngredientEntity } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(IngredientEntity)
    private readonly repo: Repository<IngredientEntity>,
  ) {}

  findAll(establishmentId: string) {
    return this.repo.find({ where: { establishmentId }, order: { name: 'ASC' } });
  }

  async findOne(id: string, establishmentId: string) {
    const ingredient = await this.repo.findOne({ where: { id, establishmentId } });
    if (!ingredient) throw new NotFoundException('Ingrédient introuvable');
    return ingredient;
  }

  create(dto: CreateIngredientDto, establishmentId: string) {
    const ingredient = this.repo.create({ ...dto, establishmentId });
    return this.repo.save(ingredient);
  }

  async update(id: string, establishmentId: string, dto: Partial<CreateIngredientDto>) {
    const ingredient = await this.findOne(id, establishmentId);
    Object.assign(ingredient, dto);
    return this.repo.save(ingredient);
  }

  async remove(id: string, establishmentId: string) {
    const ingredient = await this.findOne(id, establishmentId);
    return this.repo.softRemove(ingredient);
  }

  async getLowStockAlerts(establishmentId: string) {
    return this.repo
      .createQueryBuilder('i')
      .where('i.establishment_id = :establishmentId', { establishmentId })
      .andWhere('i.current_stock <= i.reorder_threshold')
      .andWhere('i.deleted_at IS NULL')
      .getMany();
  }

  async updateStock(id: string, quantityDelta: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(IngredientEntity)
      .set({ currentStock: () => `current_stock + ${quantityDelta}` })
      .where('id = :id', { id })
      .execute();
  }
}
