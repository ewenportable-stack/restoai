import { IsString, IsNumber, IsIn, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockMovementDto {
  @ApiProperty()
  @IsString()
  ingredientId: string;

  @ApiProperty({ enum: ['in', 'out', 'adjustment', 'waste'] })
  @IsIn(['in', 'out', 'adjustment', 'waste'])
  type: 'in' | 'out' | 'adjustment' | 'waste';

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lotId?: string;
}

export class CreateStockLotDto {
  @ApiProperty()
  @IsString()
  ingredientId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: '2025-04-15' })
  @IsString()
  expiryDate: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lotNumber?: string;
}
