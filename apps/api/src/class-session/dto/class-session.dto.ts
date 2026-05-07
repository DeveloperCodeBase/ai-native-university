import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsInt, Min, Max } from 'class-validator';

export class CreateClassSessionDto {
  @ApiProperty({ description: 'شناسه درس' })
  @IsString()
  courseId: string;

  @ApiProperty({ example: 'جلسه اول — مقدمه' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-06-01T10:00:00Z' })
  @IsDateString()
  scheduledStart: string;

  @ApiProperty({ example: '2026-06-01T11:30:00Z' })
  @IsDateString()
  scheduledEnd: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxParticipants?: number;
}

export class UpdateClassSessionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'live' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  joinUrl?: string;
}

export class RecordAttendanceDto {
  @ApiProperty({ description: 'شناسه دانشجو' })
  @IsString()
  userId: string;
}

export class CreateRecordingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storageUrl?: string;

  @ApiPropertyOptional({ example: 'video' })
  @IsOptional()
  @IsString()
  mediaType?: string;
}

export class ClassSessionQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  pageSize?: string;

  @ApiPropertyOptional({ example: 'scheduled' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseId?: string;
}
