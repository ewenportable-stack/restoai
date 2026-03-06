import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        database: config.get('DB_NAME', 'chefai'),
        username: config.get('DB_USER', 'chefai'),
        password: config.get('DB_PASSWORD', 'chefai_dev'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
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
