import {
  Controller, Get, Post, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CertificateService } from './certificate.service';
import { IssueCertificateDto } from './dto/certificate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('certificates')
@Controller('certificates')
export class CertificateController {
  constructor(private readonly svc: CertificateService) {}

  /* Public: verify a certificate by code */
  @Get('verify/:code')
  @ApiOperation({ summary: 'تأیید صحت گواهینامه (عمومی)' })
  async verify(@Param('code') code: string) {
    return { success: true, data: await this.svc.verify(code) };
  }

  /* Authenticated routes */
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my')
  @ApiOperation({ summary: 'گواهینامه‌های من' })
  async getMy(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return { success: true, data: await this.svc.findByUser(tenantId, userId) };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'جزئیات گواهینامه' })
  async getOne(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return { success: true, data: await this.svc.findById(id, tenantId) };
  }

  /* Admin/Instructor: issue manually */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'صدور گواهینامه (مدیر/استاد)' })
  async issue(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: IssueCertificateDto,
  ) {
    return { success: true, data: await this.svc.issue(tenantId, dto) };
  }

  /* Admin: revoke */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @Patch(':id/revoke')
  @ApiOperation({ summary: 'ابطال گواهینامه (مدیر)' })
  async revoke(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return { success: true, data: await this.svc.revoke(tenantId, id) };
  }
}
