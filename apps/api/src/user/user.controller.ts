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
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  async create(@CurrentUser('tenantId') tenantId: string, @Body() dto: CreateUserDto) {
    return {
      success: true,
      data: await this.userService.create(tenantId, dto),
    };
  }

  @Get()
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'List users in tenant' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('role') role?: string,
  ) {
    return {
      success: true,
      data: await this.userService.findAll(tenantId, {
        page: page ? parseInt(page, 10) : undefined,
        pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
        role,
      }),
    };
  }

  @Get(':id')
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return {
      success: true,
      data: await this.userService.findById(tenantId, id),
    };
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user (admin only)' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return {
      success: true,
      data: await this.userService.update(tenantId, id, dto),
    };
  }
}
