import { IsString, IsNumber, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StockUnit } from '@chefai/shared';

export class CreateIngredientDto {
  @ApiProperty({ example: 'Bœuf entrecôte' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Viandes' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'kg', enum: ['kg', 'g', 'l', 'ml', 'unit', 'portion'] })
  @IsIn(['kg', 'g', 'l', 'ml', 'unit', 'portion'])
  unit: StockUnit;

  @ApiProperty({ example: 32.5 })
  @IsNumber()
  @Min(0)
  unitCost: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  reorderThreshold: number;
}
