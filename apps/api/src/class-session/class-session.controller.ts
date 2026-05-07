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
import { ClassSessionService } from './class-session.service';
import {
  CreateClassSessionDto,
  UpdateClassSessionDto,
  CreateRecordingDto,
  ClassSessionQueryDto,
} from './dto/class-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('class-sessions')
@Controller('class-sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClassSessionController {
  constructor(private classSessionService: ClassSessionService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'ایجاد جلسه کلاس' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateClassSessionDto,
  ) {
    return {
      success: true,
      data: await this.classSessionService.create(tenantId, userId, dto),
    };
  }

  @Get()
  @ApiOperation({ summary: 'لیست جلسات کلاس' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: ClassSessionQueryDto,
  ) {
    return {
      success: true,
      data: await this.classSessionService.findAll(tenantId, query),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'جزئیات جلسه کلاس' })
  async findById(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      data: await this.classSessionService.findById(tenantId, id),
    };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'ویرایش جلسه کلاس' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateClassSessionDto,
  ) {
    return {
      success: true,
      data: await this.classSessionService.update(tenantId, id, dto),
    };
  }

  // --- Attendance ---

  @Post(':id/join')
  @ApiOperation({ summary: 'پیوستن به جلسه کلاس' })
  async join(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      data: await this.classSessionService.recordAttendance(tenantId, id, userId),
    };
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'ترک جلسه کلاس' })
  async leave(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      data: await this.classSessionService.recordLeave(tenantId, id, userId),
    };
  }

  // --- Recordings ---

  @Post(':id/recordings')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'افزودن ضبط به جلسه' })
  async addRecording(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: CreateRecordingDto,
  ) {
    return {
      success: true,
      data: await this.classSessionService.addRecording(tenantId, id, dto),
    };
  }

  @Get(':id/recordings')
  @ApiOperation({ summary: 'لیست ضبط‌های جلسه' })
  async findRecordings(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      data: await this.classSessionService.findRecordingsBySession(tenantId, id),
    };
  }
}
