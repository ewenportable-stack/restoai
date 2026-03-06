import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierEntity } from './entities/supplier.entity';

export class CreateSupplierDto {
  name: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly repo: Repository<SupplierEntity>,
  ) {}

  findAll(establishmentId: string) {
    return this.repo.find({ where: { establishmentId }, order: { name: 'ASC' } });
  }

  async findOne(id: string, establishmentId: string) {
    const s = await this.repo.findOne({ where: { id, establishmentId } });
    if (!s) throw new NotFoundException('Fournisseur introuvable');
    return s;
  }

  create(dto: CreateSupplierDto, establishmentId: string) {
    return this.repo.save(this.repo.create({ ...dto, establishmentId }));
  }
}
