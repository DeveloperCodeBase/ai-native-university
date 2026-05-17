import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IssueCertificateDto {
  @ApiProperty({ description: 'User ID to issue certificate to' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ description: 'Course ID (optional)' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiProperty({ description: 'Certificate title' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
