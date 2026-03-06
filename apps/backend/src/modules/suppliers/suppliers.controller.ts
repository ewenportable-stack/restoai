import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { SuppliersService, CreateSupplierDto } from './suppliers.service';

@ApiTags('suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll(@CurrentUser() user: UserEntity) {
    return this.suppliersService.findAll(user.establishmentId);
  }

  @Post()
  create(@Body() dto: CreateSupplierDto, @CurrentUser() user: UserEntity) {
    return this.suppliersService.create(dto, user.establishmentId);
  }
}
