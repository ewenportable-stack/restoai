import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRecord } from '../users/users.service';
import { OrdersService, CreateOrderDto } from './orders.service';
import { type OrderStatus } from './entities/order.entity';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@CurrentUser() user: UserRecord) {
    return this.ordersService.findAll(user.establishmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserRecord) {
    return this.ordersService.findOne(id, user.establishmentId);
  }

  @Post()
  @Roles('admin', 'chef', 'manager')
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: UserRecord) {
    return this.ordersService.create(dto, user);
  }

  @Patch(':id/status')
  @Roles('admin', 'chef', 'manager')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @CurrentUser() user: UserRecord,
  ) {
    return this.ordersService.updateStatus(id, status, user);
  }
}
