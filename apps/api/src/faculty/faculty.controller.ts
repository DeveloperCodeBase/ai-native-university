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
import { FacultyService } from './faculty.service';
import {
  CreateFacultyDto,
  UpdateFacultyDto,
  CreateDepartmentDto,
  CreateProgramDto,
} from './dto/faculty.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('faculties')
@Controller('faculties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  // --- Faculty CRUD ---

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'ایجاد دانشکده جدید' })
  async createFaculty(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateFacultyDto,
  ) {
    return {
      success: true,
      data: await this.facultyService.createFaculty(tenantId, dto),
    };
  }

  @Get()
  @ApiOperation({ summary: 'لیست دانشکده‌ها' })
  async findAllFaculties(@CurrentUser('tenantId') tenantId: string) {
    return {
      success: true,
      data: await this.facultyService.findAllFaculties(tenantId),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'جزئیات دانشکده' })
  async findFacultyById(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      data: await this.facultyService.findFacultyById(tenantId, id),
    };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'ویرایش دانشکده' })
  async updateFaculty(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFacultyDto,
  ) {
    return {
      success: true,
      data: await this.facultyService.updateFaculty(tenantId, id, dto),
    };
  }

  // --- Departments ---

  @Post(':facultyId/departments')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'ایجاد گروه آموزشی در دانشکده' })
  async createDepartment(
    @CurrentUser('tenantId') tenantId: string,
    @Param('facultyId') facultyId: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return {
      success: true,
      data: await this.facultyService.createDepartment(tenantId, facultyId, dto),
    };
  }

  @Get(':facultyId/departments')
  @ApiOperation({ summary: 'لیست گروه‌های آموزشی دانشکده' })
  async findDepartments(
    @CurrentUser('tenantId') tenantId: string,
    @Param('facultyId') facultyId: string,
  ) {
    return {
      success: true,
      data: await this.facultyService.findDepartmentsByFaculty(tenantId, facultyId),
    };
  }

  // --- Programs ---

  @Post('departments/:departmentId/programs')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'ایجاد رشته تحصیلی' })
  async createProgram(
    @CurrentUser('tenantId') tenantId: string,
    @Param('departmentId') departmentId: string,
    @Body() dto: CreateProgramDto,
  ) {
    return {
      success: true,
      data: await this.facultyService.createProgram(tenantId, departmentId, dto),
    };
  }

  @Get('departments/:departmentId/programs')
  @ApiOperation({ summary: 'لیست رشته‌های تحصیلی گروه' })
  async findPrograms(
    @CurrentUser('tenantId') tenantId: string,
    @Param('departmentId') departmentId: string,
  ) {
    return {
      success: true,
      data: await this.facultyService.findProgramsByDepartment(tenantId, departmentId),
    };
  }
}
