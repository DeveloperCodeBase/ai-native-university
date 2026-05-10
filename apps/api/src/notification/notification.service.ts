import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        tenantId,
        userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        metadata: dto.metadata as any,
      },
    });
  }

  async createForUser(tenantId: string, userId: string, type: string, title: string, body?: string, metadata?: Record<string, any>) {
    return this.prisma.notification.create({
      data: {
        tenantId,
        userId,
        type,
        title,
        body,
        metadata: metadata as any,
      },
    });
  }

  async findAll(tenantId: string, userId: string, query: NotificationQueryDto) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 20;
    const unreadOnly = query.unreadOnly === 'true';

    const where: any = { tenantId, userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { notifications, total, page, pageSize };
  }

  async getUnreadCount(tenantId: string, userId: string) {
    const count = await this.prisma.notification.count({
      where: { tenantId, userId, isRead: false },
    });
    return { unreadCount: count };
  }

  async markAsRead(tenantId: string, userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, tenantId, userId },
    });
    if (!notification) {
      throw new NotFoundException('اعلان یافت نشد');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(tenantId: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { tenantId, userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  }
}
