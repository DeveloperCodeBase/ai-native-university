import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
  EnrollmentQueryDto,
} from './dto/enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) {}

  async enroll(tenantId: string, userId: string, dto: CreateEnrollmentDto) {
    // If admin enrolling another student
    const targetUserId = dto.userId || userId;

    // Verify course belongs to tenant and is published
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, tenantId },
    });
    if (!course) {
      throw new NotFoundException('درس یافت نشد');
    }
    if (course.status !== 'published') {
      throw new ForbiddenException('این درس هنوز منتشر نشده است');
    }

    // Check duplicate
    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: targetUserId, courseId: dto.courseId } },
    });
    if (existing) {
      throw new ConflictException('دانشجو قبلاً در این درس ثبت‌نام کرده است');
    }

    return this.prisma.enrollment.create({
      data: {
        tenantId,
        userId: targetUserId,
        courseId: dto.courseId,
        status: 'active',
      },
      include: {
        course: { select: { id: true, title: true, slug: true } },
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async findAll(tenantId: string, query: EnrollmentQueryDto) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 20;

    const where: any = { tenantId };
    if (query.status) where.status = query.status;
    if (query.courseId) where.courseId = query.courseId;

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        orderBy: { enrolledAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          course: { select: { id: true, title: true, slug: true, level: true } },
          user: { select: { id: true, fullName: true, email: true, role: true } },
        },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return { enrollments, total, page, pageSize };
  }

  async findByUser(tenantId: string, userId: string) {
    return this.prisma.enrollment.findMany({
      where: { tenantId, userId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            level: true,
            thumbnailUrl: true,
            instructors: {
              include: {
                user: { select: { id: true, fullName: true } },
              },
            },
          },
        },
      },
    });
  }

  async findByCourse(tenantId: string, courseId: string) {
    return this.prisma.enrollment.findMany({
      where: { tenantId, courseId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async updateStatus(tenantId: string, enrollmentId: string, dto: UpdateEnrollmentDto) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, tenantId },
    });
    if (!enrollment) {
      throw new NotFoundException('ثبت‌نام یافت نشد');
    }

    const data: any = { status: dto.status };
    if (dto.status === 'completed') {
      data.completedAt = new Date();
      data.progress = 100;
    }
    if (dto.status === 'dropped') {
      data.droppedAt = new Date();
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data,
    });
  }

  async updateProgress(tenantId: string, enrollmentId: string, progress: number) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, tenantId },
    });
    if (!enrollment) {
      throw new NotFoundException('ثبت‌نام یافت نشد');
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { progress: Math.min(Math.max(progress, 0), 100) },
    });
  }
}
