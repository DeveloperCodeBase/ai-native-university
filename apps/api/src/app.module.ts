import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { TenantModule } from './tenant/tenant.module';
import { UserModule } from './user/user.module';
import { FacultyModule } from './faculty/faculty.module';
import { CourseModule } from './course/course.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { ClassSessionModule } from './class-session/class-session.module';
import { AssessmentModule } from './assessment/assessment.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiModule } from './ai/ai.module';
import { NotificationModule } from './notification/notification.module';
import { CommunityModule } from './community/community.module';
import { CertificateModule } from './certificate/certificate.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TerminusModule,
    PrismaModule,
    AuditModule,
    AuthModule,
    TenantModule,
    UserModule,
    FacultyModule,
    CourseModule,
    EnrollmentModule,
    ClassSessionModule,
    AssessmentModule,
    AnalyticsModule,
    AiModule,
    NotificationModule,
    CommunityModule,
    CertificateModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

