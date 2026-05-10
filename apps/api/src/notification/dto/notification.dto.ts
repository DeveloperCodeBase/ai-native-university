import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'نوع اعلان', example: 'enrollment' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'عنوان اعلان', example: 'ثبت‌نام موفق' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'متن اعلان' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ description: 'داده اضافی' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class NotificationQueryDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsString()
  pageSize?: string;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @IsString()
  unreadOnly?: string;
}
