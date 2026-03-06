import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRecord } from '../users/users.service';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';

@ApiTags('ingredients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  findAll(@CurrentUser() user: UserRecord) {
    return this.ingredientsService.findAll(user.establishmentId);
  }

  @Get('alerts/low-stock')
  getLowStock(@CurrentUser() user: UserRecord) {
    return this.ingredientsService.getLowStockAlerts(user.establishmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserRecord) {
    return this.ingredientsService.findOne(id, user.establishmentId);
  }

  @Post()
  @Roles('admin', 'chef', 'manager')
  create(@Body() dto: CreateIngredientDto, @CurrentUser() user: UserRecord) {
    return this.ingredientsService.create(dto, user.establishmentId);
  }

  @Patch(':id')
  @Roles('admin', 'chef', 'manager')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateIngredientDto>,
    @CurrentUser() user: UserRecord,
  ) {
    return this.ingredientsService.update(id, user.establishmentId, dto);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string, @CurrentUser() user: UserRecord) {
    return this.ingredientsService.remove(id, user.establishmentId);
  }
}
