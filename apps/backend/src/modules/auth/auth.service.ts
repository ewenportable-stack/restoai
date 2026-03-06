import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private buildResponse(user: { id: string; email: string; firstName: string; lastName: string; role: string; establishmentId: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      establishmentId: user.establishmentId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        establishmentId: user.establishmentId,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await this.usersService.validatePassword(user, dto.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return this.buildResponse(user);
  }

  async register(dto: RegisterDto) {
    const establishment = await this.usersService.createEstablishment(dto.restaurantName);

    const user = await this.usersService.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: dto.password,
      role: 'chef',
      establishmentId: establishment.id,
    });

    return this.buildResponse(user);
  }
}
