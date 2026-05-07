import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseModuleDto,
  CreateLessonDto,
  CourseQueryDto,
} from './dto/course.dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  // --- Course CRUD ---

  async create(tenantId: string, userId: string, dto: CreateCourseDto) {
    const existing = await this.prisma.course.findUnique({
      where: { tenantId_slug: { tenantId, slug: dto.slug } },
    });
    if (existing) {
      throw new ConflictException('درسی با این شناسه قبلاً ثبت شده است');
    }

    return this.prisma.course.create({
      data: {
        tenantId,
        createdBy: userId,
        ...dto,
      },
      include: {
        _count: { select: { modules: true, enrollments: true } },
      },
    });
  }

  async findAll(tenantId: string, query: CourseQueryDto) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 20;

    const where: any = { tenantId };
    if (query.status) where.status = query.status;
    if (query.level) where.level = query.level;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          program: { select: { id: true, name: true } },
          instructors: {
            include: {
              user: { select: { id: true, fullName: true } },
            },
          },
          _count: { select: { modules: true, enrollments: true, classSessions: true } },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return { courses, total, page, pageSize };
  }

  async findBySlug(tenantId: string, slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
      include: {
        program: {
          include: {
            department: {
              include: { faculty: { select: { id: true, name: true } } },
            },
          },
        },
        instructors: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                title: true,
                slug: true,
                contentType: true,
                durationMin: true,
                isPublished: true,
                sortOrder: true,
              },
            },
          },
        },
        _count: { select: { enrollments: true, classSessions: true, assessments: true } },
      },
    });
    if (!course) {
      throw new NotFoundException('درس یافت نشد');
    }
    return course;
  }

  async findById(tenantId: string, id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, tenantId },
      include: {
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: { orderBy: { sortOrder: 'asc' } },
          },
        },
        instructors: {
          include: {
            user: { select: { id: true, fullName: true } },
          },
        },
        _count: { select: { enrollments: true, classSessions: true, assessments: true } },
      },
    });
    if (!course) {
      throw new NotFoundException('درس یافت نشد');
    }
    return course;
  }

  async update(tenantId: string, id: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findFirst({
      where: { id, tenantId },
    });
    if (!course) {
      throw new NotFoundException('درس یافت نشد');
    }
    return this.prisma.course.update({
      where: { id },
      data: dto,
    });
  }

  // --- Course Modules ---

  async createModule(tenantId: string, courseId: string, dto: CreateCourseModuleDto) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId },
    });
    if (!course) {
      throw new NotFoundException('درس یافت نشد');
    }

    return this.prisma.courseModule.create({
      data: { courseId, ...dto },
      include: { _count: { select: { lessons: true } } },
    });
  }

  async findModulesByCourse(tenantId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId },
    });
    if (!course) {
      throw new NotFoundException('درس یافت نشد');
    }

    return this.prisma.courseModule.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: {
        lessons: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            contentType: true,
            durationMin: true,
            isPublished: true,
          },
        },
        _count: { select: { lessons: true } },
      },
    });
  }

  // --- Lessons ---

  async createLesson(tenantId: string, courseId: string, moduleId: string, dto: CreateLessonDto) {
    // Verify course+module belong to tenant
    const module = await this.prisma.courseModule.findFirst({
      where: {
        id: moduleId,
        courseId,
        course: { tenantId },
      },
    });
    if (!module) {
      throw new NotFoundException('ماژول درسی یافت نشد');
    }

    return this.prisma.lesson.create({
      data: { moduleId, ...dto },
    });
  }

  async findLessonById(tenantId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: { course: { tenantId } },
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });
    if (!lesson) {
      throw new NotFoundException('درس یافت نشد');
    }
    return lesson;
  }

  // --- Instructor assignment ---

  async assignInstructor(tenantId: string, courseId: string, userId: string, role: string = 'primary') {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId },
    });
    if (!course) {
      throw new NotFoundException('درس یافت نشد');
    }

    return this.prisma.courseInstructor.upsert({
      where: { courseId_userId: { courseId, userId } },
      update: { role },
      create: { courseId, userId, role },
    });
  }
}
