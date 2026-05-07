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
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('tutor/ask')
  @ApiOperation({ summary: 'پرسش از تیوتر هوشمند (RAG)' })
  async askTutor(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: { query: string; courseId?: string; lessonId?: string },
  ) {
    return {
      success: true,
      data: await this.aiService.ragQuery(body.query, {
        tenantId,
        userId,
        taskType: 'rag_query',
        courseId: body.courseId,
        lessonId: body.lessonId,
      }),
    };
  }

  @Post('class-sessions/:sessionId/summarize')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'خلاصه‌سازی جلسه کلاس با AI' })
  async summarize(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return {
      success: true,
      data: await this.aiService.summarizeSession(sessionId, {
        tenantId,
        userId,
        taskType: 'summarize',
        classSessionId: sessionId,
      }),
    };
  }

  @Post('class-sessions/:sessionId/extract-concepts')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'استخراج مفاهیم جلسه کلاس' })
  async extractConcepts(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return {
      success: true,
      data: await this.aiService.extractConcepts(sessionId, {
        tenantId,
        userId,
        taskType: 'extract_concepts',
        classSessionId: sessionId,
      }),
    };
  }

  @Post('class-sessions/:sessionId/generate-quiz')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'تولید آزمون از جلسه کلاس' })
  async generateQuiz(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return {
      success: true,
      data: await this.aiService.generateQuiz(sessionId, {
        tenantId,
        userId,
        taskType: 'generate_quiz',
        classSessionId: sessionId,
      }),
    };
  }

  @Post('class-sessions/:sessionId/analyze')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'تحلیل کامل جلسه کلاس' })
  async analyze(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return {
      success: true,
      data: await this.aiService.analyzeSession(sessionId, {
        tenantId,
        userId,
        taskType: 'analyze_session',
        classSessionId: sessionId,
      }),
    };
  }

  @Get('logs')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'لاگ‌های تعامل AI (ادمین)' })
  async getLogs(
    @CurrentUser('tenantId') tenantId: string,
    @Query('userId') userId?: string,
    @Query('taskType') taskType?: string,
    @Query('limit') limit?: string,
  ) {
    return {
      success: true,
      data: await this.aiService.getInteractionLogs(tenantId, {
        userId,
        taskType,
        limit: limit ? parseInt(limit, 10) : undefined,
      }),
    };
  }
}
