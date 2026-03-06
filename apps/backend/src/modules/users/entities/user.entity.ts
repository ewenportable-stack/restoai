import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '@chefai/shared';
import { BaseEntity } from '../../../common/entities/base.entity';
import { EstablishmentEntity } from '../../establishments/entities/establishment.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'varchar' })
  role: UserRole;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column()
  establishmentId: string;

  @ManyToOne(() => EstablishmentEntity, (e) => e.users)
  @JoinColumn({ name: 'establishment_id' })
  establishment: EstablishmentEntity;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
