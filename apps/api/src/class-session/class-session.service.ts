import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateClassSessionDto,
  UpdateClassSessionDto,
  CreateRecordingDto,
  ClassSessionQueryDto,
} from './dto/class-session.dto';

@Injectable()
export class ClassSessionService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateClassSessionDto) {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, tenantId },
    });
    if (!course) {
      throw new NotFoundException('درس یافت نشد');
    }

    return this.prisma.classSession.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
        scheduledStart: new Date(dto.scheduledStart),
        scheduledEnd: new Date(dto.scheduledEnd),
        maxParticipants: dto.maxParticipants || 100,
        createdBy: userId,
      },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        _count: { select: { attendances: true, recordings: true } },
      },
    });
  }

  async findAll(tenantId: string, query: ClassSessionQueryDto) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 20;

    const where: any = { tenantId };
    if (query.status) where.status = query.status;
    if (query.courseId) where.courseId = query.courseId;

    const [sessions, total] = await Promise.all([
      this.prisma.classSession.findMany({
        where,
        orderBy: { scheduledStart: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          course: { select: { id: true, title: true, slug: true } },
          _count: { select: { attendances: true, recordings: true, chatMessages: true } },
        },
      }),
      this.prisma.classSession.count({ where }),
    ]);

    return { sessions, total, page, pageSize };
  }

  async findById(tenantId: string, id: string) {
    const session = await this.prisma.classSession.findFirst({
      where: { id, tenantId },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        attendances: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        recordings: true,
        _count: { select: { chatMessages: true } },
      },
    });
    if (!session) {
      throw new NotFoundException('جلسه کلاس یافت نشد');
    }
    return session;
  }

  async update(tenantId: string, id: string, dto: UpdateClassSessionDto) {
    const session = await this.prisma.classSession.findFirst({
      where: { id, tenantId },
    });
    if (!session) {
      throw new NotFoundException('جلسه کلاس یافت نشد');
    }

    const data: any = { ...dto };
    if (dto.scheduledStart) data.scheduledStart = new Date(dto.scheduledStart);
    if (dto.scheduledEnd) data.scheduledEnd = new Date(dto.scheduledEnd);

    // Handle status transitions
    if (dto.status === 'live' && !session.actualStart) {
      data.actualStart = new Date();
    }
    if (dto.status === 'ended' && !session.actualEnd) {
      data.actualEnd = new Date();
    }

    return this.prisma.classSession.update({
      where: { id },
      data,
    });
  }

  // --- Attendance ---

  async recordAttendance(tenantId: string, sessionId: string, userId: string) {
    const session = await this.prisma.classSession.findFirst({
      where: { id: sessionId, tenantId },
    });
    if (!session) {
      throw new NotFoundException('جلسه کلاس یافت نشد');
    }

    return this.prisma.attendance.upsert({
      where: { classSessionId_userId: { classSessionId: sessionId, userId } },
      update: {}, // Already joined
      create: {
        classSessionId: sessionId,
        userId,
        joinedAt: new Date(),
      },
    });
  }

  async recordLeave(tenantId: string, sessionId: string, userId: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { classSessionId_userId: { classSessionId: sessionId, userId } },
    });
    if (!attendance) {
      throw new NotFoundException('حضور ثبت نشده');
    }

    const durationMin = Math.round(
      (new Date().getTime() - attendance.joinedAt.getTime()) / 60000,
    );

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: { leftAt: new Date(), durationMin },
    });
  }

  // --- Recordings ---

  async addRecording(tenantId: string, sessionId: string, dto: CreateRecordingDto) {
    const session = await this.prisma.classSession.findFirst({
      where: { id: sessionId, tenantId },
    });
    if (!session) {
      throw new NotFoundException('جلسه کلاس یافت نشد');
    }

    return this.prisma.recording.create({
      data: {
        classSessionId: sessionId,
        storageUrl: dto.storageUrl,
        mediaType: dto.mediaType || 'video',
        status: 'pending',
      },
    });
  }

  async findRecordingsBySession(tenantId: string, sessionId: string) {
    const session = await this.prisma.classSession.findFirst({
      where: { id: sessionId, tenantId },
    });
    if (!session) {
      throw new NotFoundException('جلسه کلاس یافت نشد');
    }

    return this.prisma.recording.findMany({
      where: { classSessionId: sessionId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
