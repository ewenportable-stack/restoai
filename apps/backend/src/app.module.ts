import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EstablishmentsModule } from './modules/establishments/establishments.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { OrdersModule } from './modules/orders/orders.module';
import { FinanceModule } from './modules/finance/finance.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    SupabaseModule,
    AuthModule,
    UsersModule,
    EstablishmentsModule,
    IngredientsModule,
    StocksModule,
    RecipesModule,
    OrdersModule,
    FinanceModule,
    SuppliersModule,
    AuditModule,
  ],
})
export class AppModule {}
