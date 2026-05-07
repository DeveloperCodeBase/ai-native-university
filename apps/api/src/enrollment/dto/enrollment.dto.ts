import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'شناسه درس' })
  @IsString()
  courseId: string;

  @ApiPropertyOptional({ description: 'شناسه دانشجو (فقط برای ادمین)' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdateEnrollmentDto {
  @ApiPropertyOptional({ example: 'completed' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class EnrollmentQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  pageSize?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseId?: string;
}
