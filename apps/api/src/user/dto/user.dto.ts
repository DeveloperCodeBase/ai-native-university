import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@demo.university.ir' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Demo@1234' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'کاربر جدید' })
  @IsString()
  @MaxLength(100)
  fullName: string;

  @ApiPropertyOptional({ example: '09123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'student', enum: ['admin', 'instructor', 'student', 'teaching_assistant'] })
  @IsString()
  role: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'کاربر ویرایش‌شده' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ example: '09123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'instructor' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
