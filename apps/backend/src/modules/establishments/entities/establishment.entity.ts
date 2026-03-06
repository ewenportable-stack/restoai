import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('establishments')
export class EstablishmentEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: 'Europe/Paris' })
  timezone: string;

  @Column({ default: 'starter', type: 'varchar' })
  planTier: 'starter' | 'pro' | 'enterprise';

  @OneToMany(() => UserEntity, (user) => user.establishment)
  users: UserEntity[];
}
