import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repo: Repository<AuditLogEntity>,
  ) {}

  log(
    user: UserEntity,
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.repo.save(
      this.repo.create({
        userId: user.id,
        userEmail: user.email,
        action,
        entityType,
        entityId,
        metadata,
        establishmentId: user.establishmentId,
      }),
    );
  }

  findAll(establishmentId: string, limit = 100) {
    return this.repo.find({
      where: { establishmentId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
