import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  tenantId: string;
  tenantSlug: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Find tenant
    const tenant = await this.resolveTenant(dto.tenantSlug, dto.email);
    if (!tenant) {
      throw new UnauthorizedException('اطلاعات ورود نامعتبر است');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: dto.email,
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('اطلاعات ورود نامعتبر است');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('اطلاعات ورود نامعتبر است');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Audit log
    await this.auditService.log({
      tenantId: tenant.id,
      actorId: user.id,
      action: 'auth.login',
      resource: 'user',
      resourceId: user.id,
    });

    return this.generateTokens(user, tenant.slug);
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Find tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.tenantSlug },
    });

    if (!tenant || tenant.status !== 'active') {
      throw new NotFoundException('سازمان مورد نظر یافت نشد');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: dto.email,
        },
      },
    });

    if (existingUser) {
      throw new ConflictException('کاربری با این ایمیل قبلاً ثبت‌نام کرده است');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        role: 'student', // Default role for self-registration
      },
    });

    // Audit log
    await this.auditService.log({
      tenantId: tenant.id,
      actorId: user.id,
      action: 'auth.register',
      resource: 'user',
      resourceId: user.id,
    });

    return this.generateTokens(user, tenant.slug);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET') + '-refresh',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { tenant: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('توکن نامعتبر است');
      }

      return this.generateTokens(user, user.tenant.slug);
    } catch {
      throw new UnauthorizedException('توکن منقضی شده یا نامعتبر است');
    }
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        tenantId: true,
        isActive: true,
        locale: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('کاربر غیرفعال است');
    }

    return user;
  }

  private async resolveTenant(tenantSlug?: string, email?: string) {
    if (tenantSlug) {
      return this.prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });
    }

    // If no tenant slug, try to find by user email
    if (email) {
      const user = await this.prisma.user.findFirst({
        where: { email },
        include: { tenant: true },
      });
      return user?.tenant ?? null;
    }

    return null;
  }

  async updateProfile(tenantId: string, userId: string, dto: { fullName?: string; phone?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { ...(dto.fullName && { fullName: dto.fullName }), ...(dto.phone !== undefined && { phone: dto.phone }) },
      select: { id: true, email: true, fullName: true, phone: true, role: true, updatedAt: true },
    });
  }

  private generateTokens(
    user: { id: string; email: string; fullName: string; role: string; tenantId: string },
    tenantSlug: string,
  ): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug,
    };

    const accessToken = this.jwtService.sign(
      { ...payload },
      {
        expiresIn: this.configService.get<number>('JWT_EXPIRATION_SECONDS', 86400),
      },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get<string>('JWT_SECRET') + '-refresh',
        expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRATION_SECONDS', 604800),
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
        tenantSlug,
      },
    };
  }
}
