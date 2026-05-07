import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogEntry {
  tenantId: string;
  actorId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  correlationId?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(entry: AuditLogEntry) {
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId: entry.tenantId,
          actorId: entry.actorId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          oldValue: entry.oldValue ? JSON.parse(JSON.stringify(entry.oldValue)) : undefined,
          newValue: entry.newValue ? JSON.parse(JSON.stringify(entry.newValue)) : undefined,
          ipAddress: entry.ipAddress,
          correlationId: entry.correlationId,
        },
      });
    } catch (error) {
      // Audit logging should never break the main flow
      console.error('Audit log error:', error);
    }
  }

  async findByTenant(tenantId: string, options?: { page?: number; pageSize?: number }) {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 50;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);

    return { logs, total, page, pageSize };
  }
}
