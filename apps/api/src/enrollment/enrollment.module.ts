import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { CertificateModule } from '../certificate/certificate.module';

@Module({
  imports: [CertificateModule],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
