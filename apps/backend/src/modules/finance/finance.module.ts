import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { RecipesModule } from '../recipes/recipes.module';
import { IngredientsModule } from '../ingredients/ingredients.module';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [RecipesModule, IngredientsModule, StocksModule],
  providers: [FinanceService],
  controllers: [FinanceController],
})
export class FinanceModule {}
