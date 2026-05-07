import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssessmentService } from './assessment.service';
import {
  CreateAssessmentDto,
  UpdateAssessmentDto,
  CreateQuestionDto,
  CreateSubmissionDto,
  GradeSubmissionDto,
} from './dto/assessment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('assessments')
@Controller('assessments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssessmentController {
  constructor(private assessmentService: AssessmentService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'ایجاد آزمون/تکلیف' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAssessmentDto,
  ) {
    return {
      success: true,
      data: await this.assessmentService.create(tenantId, userId, dto),
    };
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'لیست آزمون‌های درس' })
  async findByCourse(
    @CurrentUser('tenantId') tenantId: string,
    @Param('courseId') courseId: string,
  ) {
    return {
      success: true,
      data: await this.assessmentService.findByCourse(tenantId, courseId),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'جزئیات آزمون' })
  async findById(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      data: await this.assessmentService.findById(tenantId, id),
    };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'ویرایش آزمون' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentDto,
  ) {
    return {
      success: true,
      data: await this.assessmentService.update(tenantId, id, dto),
    };
  }

  // --- Questions ---

  @Post(':id/questions')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'افزودن سوال به آزمون' })
  async addQuestion(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return {
      success: true,
      data: await this.assessmentService.addQuestion(tenantId, id, dto),
    };
  }

  @Get(':id/questions')
  @ApiOperation({ summary: 'لیست سوالات آزمون' })
  async findQuestions(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      data: await this.assessmentService.findQuestions(tenantId, id),
    };
  }

  // --- Submissions ---

  @Post(':id/submit')
  @ApiOperation({ summary: 'ارسال پاسخ آزمون' })
  async submit(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateSubmissionDto,
  ) {
    return {
      success: true,
      data: await this.assessmentService.submit(tenantId, id, userId, dto),
    };
  }

  @Get(':id/submissions')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'لیست پاسخ‌نامه‌ها (استاد/ادمین)' })
  async findSubmissions(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      data: await this.assessmentService.findSubmissions(tenantId, id),
    };
  }

  @Get(':id/submissions/my')
  @ApiOperation({ summary: 'پاسخ‌نامه‌های من' })
  async findMySubmissions(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      data: await this.assessmentService.findMySubmissions(id, userId),
    };
  }

  @Patch('submissions/:submissionId/grade')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'نمره‌دهی پاسخ‌نامه' })
  async grade(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') graderId: string,
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return {
      success: true,
      data: await this.assessmentService.gradeSubmission(tenantId, submissionId, graderId, dto),
    };
  }
}
