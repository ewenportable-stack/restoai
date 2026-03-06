import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderLineEntity } from './entities/order-line.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { IngredientsModule } from '../ingredients/ingredients.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderLineEntity]), IngredientsModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
