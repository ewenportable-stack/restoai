import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class RecipeIngredientDto {
  @ApiProperty()
  @IsString()
  ingredientId: string;

  @ApiProperty({ example: 0.2 })
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateRecipeDto {
  @ApiProperty({ example: 'Entrecôte sauce béarnaise' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Viandes' })
  @IsString()
  category: string;

  @ApiProperty({ example: 32 })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  portions: number;

  @ApiProperty({ type: [RecipeIngredientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];
}
