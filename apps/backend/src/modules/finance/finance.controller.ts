import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { FinanceService } from './finance.service';

@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: UserEntity) {
    return this.financeService.getDashboardStats(user.establishmentId);
  }

  @Get('profitability')
  @Roles('admin', 'manager', 'chef')
  getProfitability(@CurrentUser() user: UserEntity) {
    return this.financeService.getRecipeProfitability(user.establishmentId);
  }

  @Get('simulate')
  @Roles('admin', 'manager')
  simulate(
    @Query('ingredientId') ingredientId: string,
    @Query('changePercent') changePercent: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.financeService.simulatePriceChange(
      ingredientId,
      parseFloat(changePercent),
      user.establishmentId,
    );
  }
}
