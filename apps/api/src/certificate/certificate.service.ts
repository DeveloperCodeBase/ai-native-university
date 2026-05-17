import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IssueCertificateDto } from './dto/certificate.dto';

@Injectable()
export class CertificateService {
  constructor(private prisma: PrismaService) {}

  async issue(tenantId: string, dto: IssueCertificateDto) {
    const verificationCode = this.generateCode();
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3010';

    return this.prisma.certificate.create({
      data: {
        tenantId,
        userId: dto.userId,
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
        verificationUrl: `${baseUrl}/certificates/verify/${verificationCode}`,
        badgeJson: {
          '@context': 'https://w3id.org/openbadges/v2',
          type: 'Assertion',
          id: verificationCode,
          recipient: { type: 'id', identity: dto.userId },
          badge: { name: dto.title, description: dto.description || '' },
          issuedOn: new Date().toISOString(),
        },
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    });
  }

  async issueOnCompletion(tenantId: string, userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return null;

    const existing = await this.prisma.certificate.findFirst({
      where: { tenantId, userId, courseId },
    });
    if (existing) return existing;

    return this.issue(tenantId, {
      userId,
      courseId,
      title: `گواهینامه اتمام: ${course.title}`,
      description: `این گواهینامه تأیید می‌کند که دوره ${course.title} با موفقیت به اتمام رسیده است.`,
    });
  }

  async findByUser(tenantId: string, userId: string) {
    return this.prisma.certificate.findMany({
      where: { tenantId, userId, revokedAt: null },
      orderBy: { issuedAt: 'desc' },
      include: {
        course: { select: { id: true, title: true, slug: true } },
      },
    });
  }

  async findById(id: string, tenantId: string) {
    const cert = await this.prisma.certificate.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    });
    if (!cert) throw new NotFoundException('گواهینامه یافت نشد');
    return cert;
  }

  async verify(code: string) {
    const cert = await this.prisma.certificate.findFirst({
      where: {
        verificationUrl: { contains: code },
        revokedAt: null,
      },
      include: {
        user: { select: { id: true, fullName: true } },
        course: { select: { id: true, title: true } },
        tenant: { select: { id: true, name: true } },
      },
    });
    if (!cert) throw new NotFoundException('گواهینامه معتبر نیست');
    return cert;
  }

  async revoke(tenantId: string, id: string) {
    const cert = await this.prisma.certificate.findFirst({
      where: { id, tenantId },
    });
    if (!cert) throw new NotFoundException('گواهینامه یافت نشد');
    return this.prisma.certificate.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  private generateCode(): string {
    return `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }
}
