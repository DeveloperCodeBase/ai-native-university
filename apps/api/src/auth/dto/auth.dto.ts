import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@demo.university.ir' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Demo@1234' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'demo-university' })
  @IsOptional()
  @IsString()
  tenantSlug?: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'student@demo.university.ir' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Demo@1234' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'علی احمدی' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiPropertyOptional({ example: '09123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'demo-university' })
  @IsString()
  tenantSlug: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    tenantId: string;
    tenantSlug: string;
  };
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}
