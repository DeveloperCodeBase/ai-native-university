import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLearningEventDto, AnalyticsQueryDto } from './dto/analytics.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // --- Event Ingestion ---

  async ingestEvent(tenantId: string, actorId: string, dto: CreateLearningEventDto) {
    return this.prisma.learningEvent.create({
      data: {
        tenantId,
        actorId,
        eventType: dto.eventType,
        objectId: dto.objectId,
        objectType: dto.objectType,
        courseId: dto.courseId,
        lessonId: dto.lessonId,
        classSessionId: dto.classSessionId,
        context: dto.context as any,
        correlationId: uuidv4(),
      },
    });
  }

  async ingestBatch(tenantId: string, actorId: string, events: CreateLearningEventDto[]) {
    const correlationId = uuidv4();
    return this.prisma.learningEvent.createMany({
      data: events.map((dto) => ({
        tenantId,
        actorId,
        eventType: dto.eventType,
        objectId: dto.objectId,
        objectType: dto.objectType,
        courseId: dto.courseId,
        lessonId: dto.lessonId,
        classSessionId: dto.classSessionId,
        context: dto.context as any,
        correlationId,
      })),
    });
  }

  // --- Student Progress ---

  async getStudentProgress(tenantId: string, userId: string) {
    // Get enrollments with progress
    const enrollments = await this.prisma.enrollment.findMany({
      where: { tenantId, userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            modules: {
              select: {
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
    });

    // Count learning events by course
    const eventCounts = await this.prisma.learningEvent.groupBy({
      by: ['courseId', 'eventType'],
      where: { tenantId, actorId: userId },
      _count: true,
    });

    // Calculate progress per course
    return enrollments.map((enrollment) => {
      const totalLessons = enrollment.course.modules.reduce(
        (sum, mod) => sum + mod.lessons.length,
        0,
      );

      const completedLessons = eventCounts
        .filter(
          (e) =>
            e.courseId === enrollment.courseId &&
            e.eventType === 'lesson_completed',
        )
        .reduce((sum, e) => sum + e._count, 0);

      const courseEvents = eventCounts.filter(
        (e) => e.courseId === enrollment.courseId,
      );

      return {
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        courseSlug: enrollment.course.slug,
        enrollmentStatus: enrollment.status,
        progress: enrollment.progress,
        totalLessons,
        completedLessons,
        eventSummary: courseEvents.reduce(
          (acc, e) => ({ ...acc, [e.eventType]: e._count }),
          {} as Record<string, number>,
        ),
      };
    });
  }

  // --- Instructor Course Analytics ---

  async getCourseAnalytics(tenantId: string, courseId: string) {
    const [enrollmentStats, eventCounts, recentEvents] = await Promise.all([
      // Enrollment stats
      this.prisma.enrollment.groupBy({
        by: ['status'],
        where: { tenantId, courseId },
        _count: true,
      }),

      // Event counts
      this.prisma.learningEvent.groupBy({
        by: ['eventType'],
        where: { tenantId, courseId },
        _count: true,
      }),

      // Recent events
      this.prisma.learningEvent.findMany({
        where: { tenantId, courseId },
        orderBy: { timestamp: 'desc' },
        take: 20,
        include: {
          actor: { select: { id: true, fullName: true } },
        },
      }),
    ]);

    return {
      courseId,
      enrollmentStats: enrollmentStats.reduce(
        (acc, e) => ({ ...acc, [e.status]: e._count }),
        {} as Record<string, number>,
      ),
      eventCounts: eventCounts.reduce(
        (acc, e) => ({ ...acc, [e.eventType]: e._count }),
        {} as Record<string, number>,
      ),
      recentEvents,
    };
  }

  // --- Admin Tenant Analytics ---

  async getTenantAnalytics(tenantId: string) {
    const [userCount, courseCount, enrollmentCount, eventCount, recentEvents] =
      await Promise.all([
        this.prisma.user.count({ where: { tenantId } }),
        this.prisma.course.count({ where: { tenantId } }),
        this.prisma.enrollment.count({ where: { tenantId } }),
        this.prisma.learningEvent.count({ where: { tenantId } }),
        this.prisma.learningEvent.findMany({
          where: { tenantId },
          orderBy: { timestamp: 'desc' },
          take: 30,
          include: {
            actor: { select: { id: true, fullName: true } },
          },
        }),
      ]);

    // Event type breakdown
    const eventBreakdown = await this.prisma.learningEvent.groupBy({
      by: ['eventType'],
      where: { tenantId },
      _count: true,
    });

    return {
      summary: {
        totalUsers: userCount,
        totalCourses: courseCount,
        totalEnrollments: enrollmentCount,
        totalEvents: eventCount,
      },
      eventBreakdown: eventBreakdown.reduce(
        (acc, e) => ({ ...acc, [e.eventType]: e._count }),
        {} as Record<string, number>,
      ),
      recentEvents,
    };
  }

  // --- Risk Score (Rule-based MVP) ---

  async calculateRiskScore(tenantId: string, userId: string, courseId: string) {
    const events = await this.prisma.learningEvent.findMany({
      where: { tenantId, actorId: userId, courseId },
      orderBy: { timestamp: 'desc' },
    });

    // Simple rule-based risk assessment
    const totalEvents = events.length;
    const lastEventDate = events[0]?.timestamp;
    const confusionReports = events.filter(
      (e) => e.eventType === 'confusion_reported',
    ).length;
    const lessonsCompleted = events.filter(
      (e) => e.eventType === 'lesson_completed',
    ).length;

    let riskScore = 0;
    let reasons: string[] = [];

    // No activity in 7+ days
    if (lastEventDate) {
      const daysSinceLastActivity = Math.floor(
        (Date.now() - lastEventDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceLastActivity > 14) {
        riskScore += 40;
        reasons.push(`${daysSinceLastActivity} روز بدون فعالیت`);
      } else if (daysSinceLastActivity > 7) {
        riskScore += 20;
        reasons.push(`${daysSinceLastActivity} روز بدون فعالیت`);
      }
    } else {
      riskScore += 30;
      reasons.push('هیچ فعالیتی ثبت نشده');
    }

    // Low event count
    if (totalEvents < 5) {
      riskScore += 20;
      reasons.push('تعداد فعالیت‌ها کم است');
    }

    // High confusion
    if (confusionReports > 3) {
      riskScore += 15;
      reasons.push(`${confusionReports} گزارش سردرگمی`);
    }

    // Low lesson completion
    if (lessonsCompleted === 0) {
      riskScore += 15;
      reasons.push('هیچ درسی تکمیل نشده');
    }

    const normalizedScore = Math.min(riskScore, 100);
    const riskLevel =
      normalizedScore >= 60 ? 'high' : normalizedScore >= 30 ? 'medium' : 'low';

    return {
      userId,
      courseId,
      riskScore: normalizedScore,
      riskLevel,
      reasons,
      humanReviewRequired: riskLevel === 'high',
      note: 'این نمره بر اساس قوانین ساده محاسبه شده و نیاز به بازبینی انسانی دارد. نمره نهایی توسط ML بهبود خواهد یافت.',
    };
  }
}
