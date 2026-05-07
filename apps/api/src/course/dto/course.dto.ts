import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';

// --- Course ---

export class CreateCourseDto {
  @ApiProperty({ example: 'مبانی هوش مصنوعی' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'intro-ai' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: 'آشنایی با مفاهیم پایه هوش مصنوعی' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'beginner' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  programId?: string;

  @ApiPropertyOptional({ example: 'fa' })
  @IsOptional()
  @IsString()
  language?: string;
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'مبانی هوش مصنوعی - ویرایش دوم' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'published' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}

// --- Course Module ---

export class CreateCourseModuleDto {
  @ApiProperty({ example: 'مقدمه و تاریخچه' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'intro-history' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

// --- Lesson ---

export class CreateLessonDto {
  @ApiProperty({ example: 'هوش مصنوعی چیست؟' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'what-is-ai' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: '# محتوای درس\n\nمتن درس به صورت مارک‌داون' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'text' })
  @IsOptional()
  @IsString()
  contentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsInt()
  durationMin?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class CourseQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  pageSize?: string;

  @ApiPropertyOptional({ example: 'published' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'beginner' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
