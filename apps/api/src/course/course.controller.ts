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
import { CourseService } from './course.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseModuleDto,
  CreateLessonDto,
  CourseQueryDto,
} from './dto/course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  // --- Public Course Catalog ---

  @Get('catalog')
  @ApiOperation({ summary: 'کاتالوگ دروس (عمومی — فقط published)' })
  async catalog(
    @Query('tenantId') tenantId: string,
    @Query() query: CourseQueryDto,
  ) {
    return {
      success: true,
      data: await this.courseService.findCatalog(tenantId || null, { ...query, status: 'published' }),
    };
  }

  @Get('catalog/:slug')
  @ApiOperation({ summary: 'جزئیات درس (عمومی)' })
  async catalogDetail(
    @Param('slug') slug: string,
    @Query('tenantId') tenantId: string,
  ) {
    return {
      success: true,
      data: await this.courseService.findBySlug(tenantId || '', slug),
    };
  }

  // --- Authenticated Endpoints ---

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد درس جدید' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCourseDto,
  ) {
    return {
      success: true,
      data: await this.courseService.create(tenantId, userId, dto),
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لیست دروس (نیاز به احراز هویت)' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: CourseQueryDto,
  ) {
    return {
      success: true,
      data: await this.courseService.findAll(tenantId, query),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جزئیات درس با ID' })
  async findById(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      data: await this.courseService.findById(tenantId, id),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش درس' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return {
      success: true,
      data: await this.courseService.update(tenantId, id, dto),
    };
  }

  // --- Course Modules ---

  @Post(':courseId/modules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد ماژول درسی' })
  async createModule(
    @CurrentUser('tenantId') tenantId: string,
    @Param('courseId') courseId: string,
    @Body() dto: CreateCourseModuleDto,
  ) {
    return {
      success: true,
      data: await this.courseService.createModule(tenantId, courseId, dto),
    };
  }

  @Get(':courseId/modules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لیست ماژول‌های درس' })
  async findModules(
    @CurrentUser('tenantId') tenantId: string,
    @Param('courseId') courseId: string,
  ) {
    return {
      success: true,
      data: await this.courseService.findModulesByCourse(tenantId, courseId),
    };
  }

  // --- Lessons ---

  @Post(':courseId/modules/:moduleId/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد درس (Lesson) در ماژول' })
  async createLesson(
    @CurrentUser('tenantId') tenantId: string,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return {
      success: true,
      data: await this.courseService.createLesson(tenantId, courseId, moduleId, dto),
    };
  }

  @Get('lessons/:lessonId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جزئیات درس (Lesson)' })
  async findLesson(
    @CurrentUser('tenantId') tenantId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return {
      success: true,
      data: await this.courseService.findLessonById(tenantId, lessonId),
    };
  }

  // --- Instructor Assignment ---

  @Post(':courseId/instructors/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تخصیص استاد به درس' })
  async assignInstructor(
    @CurrentUser('tenantId') tenantId: string,
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
    @Body('role') role: string,
  ) {
    return {
      success: true,
      data: await this.courseService.assignInstructor(tenantId, courseId, userId, role || 'primary'),
    };
  }

  // --- Content Versioning ---

  @Post(':courseId/versions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ایجاد نسخه جدید از درس' })
  async createNewVersion(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return {
      success: true,
      data: await this.courseService.createNewVersion(tenantId, courseId, userId),
    };
  }

  @Get(':courseId/versions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لیست نسخه‌های درس' })
  async getCourseVersions(
    @CurrentUser('tenantId') tenantId: string,
    @Param('courseId') courseId: string,
  ) {
    return {
      success: true,
      data: await this.courseService.getCourseVersions(tenantId, courseId),
    };
  }

  @Post(':courseId/versions/:targetVersionId/revert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'بازگشت به نسخه قبلی درس' })
  async revertToVersion(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('courseId') courseId: string,
    @Param('targetVersionId') targetVersionId: string,
  ) {
    return {
      success: true,
      data: await this.courseService.revertToVersion(tenantId, courseId, targetVersionId, userId),
    };
  }
}

