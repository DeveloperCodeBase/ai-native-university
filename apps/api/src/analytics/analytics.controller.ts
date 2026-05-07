import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CreateLearningEventDto, AnalyticsQueryDto } from './dto/analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  // --- Event Ingestion ---

  @Post('events')
  @ApiOperation({ summary: 'ثبت رویداد یادگیری' })
  async ingestEvent(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateLearningEventDto,
  ) {
    return {
      success: true,
      data: await this.analyticsService.ingestEvent(tenantId, userId, dto),
    };
  }

  @Post('events/batch')
  @ApiOperation({ summary: 'ثبت دسته‌ای رویدادها' })
  async ingestBatch(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() events: CreateLearningEventDto[],
  ) {
    return {
      success: true,
      data: await this.analyticsService.ingestBatch(tenantId, userId, events),
    };
  }

  // --- Student Progress ---

  @Get('progress/my')
  @ApiOperation({ summary: 'پیشرفت تحصیلی من' })
  async getMyProgress(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return {
      success: true,
      data: await this.analyticsService.getStudentProgress(tenantId, userId),
    };
  }

  @Get('progress/student/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'پیشرفت تحصیلی دانشجو (استاد/ادمین)' })
  async getStudentProgress(
    @CurrentUser('tenantId') tenantId: string,
    @Param('userId') userId: string,
  ) {
    return {
      success: true,
      data: await this.analyticsService.getStudentProgress(tenantId, userId),
    };
  }

  // --- Course Analytics ---

  @Get('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'تحلیل درس (استاد/ادمین)' })
  async getCourseAnalytics(
    @CurrentUser('tenantId') tenantId: string,
    @Param('courseId') courseId: string,
  ) {
    return {
      success: true,
      data: await this.analyticsService.getCourseAnalytics(tenantId, courseId),
    };
  }

  // --- Tenant Analytics ---

  @Get('tenant')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'تحلیل سازمان (ادمین)' })
  async getTenantAnalytics(
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return {
      success: true,
      data: await this.analyticsService.getTenantAnalytics(tenantId),
    };
  }

  // --- Risk Score ---

  @Get('risk/:userId/:courseId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'نمره ریسک تحصیلی دانشجو (قانون‌محور — نیاز به بازبینی انسانی)' })
  async getRiskScore(
    @CurrentUser('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return {
      success: true,
      data: await this.analyticsService.calculateRiskScore(tenantId, userId, courseId),
    };
  }
}
