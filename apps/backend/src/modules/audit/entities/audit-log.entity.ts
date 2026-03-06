import { Column, Entity, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userEmail: string;

  @Column()
  action: string;

  @Column()
  entityType: string;

  @Column({ nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column()
  establishmentId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
