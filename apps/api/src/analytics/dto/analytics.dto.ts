import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateLearningEventDto {
  @ApiProperty({
    example: 'lesson_completed',
    description: 'نوع رویداد: course_opened, lesson_opened, lesson_completed, video_played, video_paused, quiz_started, quiz_submitted, assignment_submitted, class_joined, class_left, ai_tutor_asked, ai_summary_viewed, confusion_reported',
  })
  @IsString()
  eventType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objectType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lessonId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  classSessionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  to?: string;
}
