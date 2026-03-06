import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UserRecord } from '../users/users.service';

@Injectable()
export class AuditService {
  constructor(private readonly supabase: SupabaseService) {}

  async log(
    user: UserRecord,
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.supabase.db.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      establishment_id: user.establishmentId,
    });
  }

  async findAll(establishmentId: string, limit = 100) {
    const { data } = await this.supabase.db
      .from('audit_logs')
      .select('*')
      .eq('establishment_id', establishmentId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return data ?? [];
  }
}
