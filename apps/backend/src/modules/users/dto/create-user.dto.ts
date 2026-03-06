import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';
import { UserRole } from '@chefai/shared';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(['admin', 'chef', 'manager', 'server'])
  role: UserRole;

  @IsString()
  establishmentId: string;
}
