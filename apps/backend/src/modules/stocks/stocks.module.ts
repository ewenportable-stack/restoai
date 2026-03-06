import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovementEntity } from './entities/stock-movement.entity';
import { StockLotEntity } from './entities/stock-lot.entity';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { IngredientsModule } from '../ingredients/ingredients.module';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovementEntity, StockLotEntity]), IngredientsModule],
  providers: [StocksService],
  controllers: [StocksController],
  exports: [StocksService],
})
export class StocksModule {}
