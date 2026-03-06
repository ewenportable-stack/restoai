import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRecord } from '../users/users.service';
import { StocksService } from './stocks.service';
import { CreateStockMovementDto, CreateStockLotDto } from './dto/create-stock-movement.dto';

@ApiTags('stocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get('movements')
  getMovements(@CurrentUser() user: UserRecord, @Query('ingredientId') ingredientId?: string) {
    return this.stocksService.getMovements(user.establishmentId, ingredientId);
  }

  @Get('lots')
  getLots(@CurrentUser() user: UserRecord) {
    return this.stocksService.getLots(user.establishmentId);
  }

  @Get('alerts/dlc')
  getDlcAlerts(@CurrentUser() user: UserRecord) {
    return this.stocksService.getDlcAlerts(user.establishmentId);
  }

  @Post('movements')
  @Roles('admin', 'chef', 'manager')
  addMovement(@Body() dto: CreateStockMovementDto, @CurrentUser() user: UserRecord) {
    return this.stocksService.addMovement(dto, user);
  }

  @Post('lots')
  @Roles('admin', 'chef', 'manager')
  addLot(@Body() dto: CreateStockLotDto, @CurrentUser() user: UserRecord) {
    return this.stocksService.addLot(dto, user);
  }
}
