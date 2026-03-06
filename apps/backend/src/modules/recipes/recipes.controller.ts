import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@ApiTags('recipes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  findAll(@CurrentUser() user: UserEntity) {
    return this.recipesService.findAll(user.establishmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.recipesService.findOne(id, user.establishmentId);
  }

  @Post()
  @Roles('admin', 'chef', 'manager')
  create(@Body() dto: CreateRecipeDto, @CurrentUser() user: UserEntity) {
    return this.recipesService.create(dto, user.establishmentId);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  remove(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.recipesService.remove(id, user.establishmentId);
  }
}
