import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstablishmentEntity } from './entities/establishment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstablishmentEntity])],
  exports: [TypeOrmModule],
})
export class EstablishmentsModule {}
