import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async findByEstablishment(establishmentId: string): Promise<UserEntity[]> {
    return this.usersRepo.find({ where: { establishmentId } });
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email déjà utilisé');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, passwordHash });
    return this.usersRepo.save(user);
  }

  async validatePassword(user: UserEntity, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
