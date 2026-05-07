import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import {
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
  EnrollmentQueryDto,
} from './dto/enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) {}

  @Post()
  @ApiOperation({ summary: 'ثبت‌نام در درس' })
  async enroll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateEnrollmentDto,
  ) {
    return {
      success: true,
      data: await this.enrollmentService.enroll(tenantId, userId, dto),
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'لیست ثبت‌نام‌ها (ادمین/استاد)' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: EnrollmentQueryDto,
  ) {
    return {
      success: true,
      data: await this.enrollmentService.findAll(tenantId, query),
    };
  }

  @Get('my')
  @ApiOperation({ summary: 'ثبت‌نام‌های من' })
  async findMy(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return {
      success: true,
      data: await this.enrollmentService.findByUser(tenantId, userId),
    };
  }

  @Get('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'دانشجویان ثبت‌نام شده در درس' })
  async findByCourse(
    @CurrentUser('tenantId') tenantId: string,
    @Param('courseId') courseId: string,
  ) {
    return {
      success: true,
      data: await this.enrollmentService.findByCourse(tenantId, courseId),
    };
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'تغییر وضعیت ثبت‌نام' })
  async updateStatus(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentDto,
  ) {
    return {
      success: true,
      data: await this.enrollmentService.updateStatus(tenantId, id, dto),
    };
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'به‌روزرسانی پیشرفت' })
  async updateProgress(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body('progress') progress: number,
  ) {
    return {
      success: true,
      data: await this.enrollmentService.updateProgress(tenantId, id, progress),
    };
  }
}
