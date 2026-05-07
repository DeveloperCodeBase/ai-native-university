import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('سازمانی با این شناسه قبلاً ثبت شده است');
    }

    return this.prisma.tenant.create({ data: dto });
  }

  async findAll(options?: { page?: number; pageSize?: number }) {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 20;

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { users: true, courses: true } } },
      }),
      this.prisma.tenant.count(),
    ]);

    return { tenants, total, page, pageSize };
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { _count: { select: { users: true, courses: true, faculties: true } } },
    });

    if (!tenant) {
      throw new NotFoundException('سازمان یافت نشد');
    }

    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException('سازمان یافت نشد');
    }

    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('سازمان یافت نشد');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: dto,
    });
  }
}
