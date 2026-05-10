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
import { NotificationService } from './notification.service';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'لیست اعلان‌های کاربر' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return {
      success: true,
      data: await this.notificationService.findAll(tenantId, userId, query),
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'تعداد اعلان‌های خوانده نشده' })
  async getUnreadCount(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return {
      success: true,
      data: await this.notificationService.getUnreadCount(tenantId, userId),
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'خواندن اعلان' })
  async markAsRead(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      data: await this.notificationService.markAsRead(tenantId, userId, id),
    };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'خواندن همه اعلان‌ها' })
  async markAllAsRead(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return {
      success: true,
      data: await this.notificationService.markAllAsRead(tenantId, userId),
    };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'ایجاد اعلان سیستمی (فقط ادمین)' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateNotificationDto & { userId: string },
  ) {
    return {
      success: true,
      data: await this.notificationService.create(tenantId, dto.userId, dto),
    };
  }
}
