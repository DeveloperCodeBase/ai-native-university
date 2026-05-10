import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { CreateThreadDto, CreateReplyDto, ThreadQueryDto } from './dto/community.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('community')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  // --- Threads ---

  @Post('courses/:courseId/threads')
  @ApiOperation({ summary: 'ایجاد موضوع جدید در انجمن درس' })
  async createThread(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('courseId') courseId: string,
    @Body() dto: CreateThreadDto,
  ) {
    return {
      success: true,
      data: await this.communityService.createThread(tenantId, courseId, userId, dto),
    };
  }

  @Get('courses/:courseId/threads')
  @ApiOperation({ summary: 'لیست موضوعات انجمن درس' })
  async findThreads(
    @CurrentUser('tenantId') tenantId: string,
    @Param('courseId') courseId: string,
    @Query() query: ThreadQueryDto,
  ) {
    return {
      success: true,
      data: await this.communityService.findThreads(tenantId, courseId, query),
    };
  }

  @Get('threads/:threadId')
  @ApiOperation({ summary: 'جزئیات موضوع و پاسخ‌ها' })
  async findThread(
    @CurrentUser('tenantId') tenantId: string,
    @Param('threadId') threadId: string,
  ) {
    return {
      success: true,
      data: await this.communityService.findThreadById(tenantId, threadId),
    };
  }

  // --- Replies ---

  @Post('threads/:threadId/replies')
  @ApiOperation({ summary: 'ارسال پاسخ به موضوع' })
  async createReply(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('threadId') threadId: string,
    @Body() dto: CreateReplyDto,
  ) {
    return {
      success: true,
      data: await this.communityService.createReply(tenantId, threadId, userId, dto),
    };
  }

  // --- Like ---

  @Post('replies/:replyId/like')
  @ApiOperation({ summary: 'لایک / بازپس‌گیری لایک پاسخ' })
  async toggleLike(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('replyId') replyId: string,
  ) {
    return {
      success: true,
      data: await this.communityService.toggleLike(tenantId, replyId, userId),
    };
  }

  // --- Mark Answer ---

  @Patch('replies/:replyId/mark-answer')
  @ApiOperation({ summary: 'انتخاب پاسخ برتر' })
  async markAnswer(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
    @Param('replyId') replyId: string,
  ) {
    return {
      success: true,
      data: await this.communityService.markAsAnswer(tenantId, replyId, userId, userRole),
    };
  }

  // --- Moderation ---

  @Patch('threads/:threadId/pin')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'سنجاق / برداشتن سنجاق موضوع' })
  async togglePin(
    @CurrentUser('tenantId') tenantId: string,
    @Param('threadId') threadId: string,
  ) {
    return {
      success: true,
      data: await this.communityService.togglePin(tenantId, threadId),
    };
  }

  @Patch('threads/:threadId/lock')
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'قفل / بازکردن موضوع' })
  async toggleLock(
    @CurrentUser('tenantId') tenantId: string,
    @Param('threadId') threadId: string,
  ) {
    return {
      success: true,
      data: await this.communityService.toggleLock(tenantId, threadId),
    };
  }
}
