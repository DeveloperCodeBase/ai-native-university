import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFacultyDto,
  UpdateFacultyDto,
  CreateDepartmentDto,
  CreateProgramDto,
} from './dto/faculty.dto';

@Injectable()
export class FacultyService {
  constructor(private prisma: PrismaService) {}

  // --- Faculty ---

  async createFaculty(tenantId: string, dto: CreateFacultyDto) {
    const existing = await this.prisma.faculty.findUnique({
      where: { tenantId_slug: { tenantId, slug: dto.slug } },
    });
    if (existing) {
      throw new ConflictException('دانشکده‌ای با این شناسه قبلاً ثبت شده است');
    }

    return this.prisma.faculty.create({
      data: { tenantId, ...dto },
      include: { _count: { select: { departments: true } } },
    });
  }

  async findAllFaculties(tenantId: string) {
    return this.prisma.faculty.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { departments: true } },
        departments: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async findFacultyById(tenantId: string, id: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { id, tenantId },
      include: {
        departments: {
          include: {
            _count: { select: { programs: true } },
          },
        },
      },
    });
    if (!faculty) {
      throw new NotFoundException('دانشکده یافت نشد');
    }
    return faculty;
  }

  async updateFaculty(tenantId: string, id: string, dto: UpdateFacultyDto) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { id, tenantId },
    });
    if (!faculty) {
      throw new NotFoundException('دانشکده یافت نشد');
    }
    return this.prisma.faculty.update({
      where: { id },
      data: dto,
    });
  }

  // --- Department ---

  async createDepartment(tenantId: string, facultyId: string, dto: CreateDepartmentDto) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { id: facultyId, tenantId },
    });
    if (!faculty) {
      throw new NotFoundException('دانشکده یافت نشد');
    }

    return this.prisma.department.create({
      data: { facultyId, ...dto },
      include: { _count: { select: { programs: true } } },
    });
  }

  async findDepartmentsByFaculty(tenantId: string, facultyId: string) {
    const faculty = await this.prisma.faculty.findFirst({
      where: { id: facultyId, tenantId },
    });
    if (!faculty) {
      throw new NotFoundException('دانشکده یافت نشد');
    }

    return this.prisma.department.findMany({
      where: { facultyId },
      include: { _count: { select: { programs: true } } },
    });
  }

  // --- Program ---

  async createProgram(tenantId: string, departmentId: string, dto: CreateProgramDto) {
    // Verify department belongs to tenant (via faculty)
    const department = await this.prisma.department.findFirst({
      where: {
        id: departmentId,
        faculty: { tenantId },
      },
    });
    if (!department) {
      throw new NotFoundException('گروه آموزشی یافت نشد');
    }

    return this.prisma.program.create({
      data: { departmentId, ...dto },
    });
  }

  async findProgramsByDepartment(tenantId: string, departmentId: string) {
    const department = await this.prisma.department.findFirst({
      where: {
        id: departmentId,
        faculty: { tenantId },
      },
    });
    if (!department) {
      throw new NotFoundException('گروه آموزشی یافت نشد');
    }

    return this.prisma.program.findMany({
      where: { departmentId },
      include: { _count: { select: { courses: true } } },
    });
  }
}
