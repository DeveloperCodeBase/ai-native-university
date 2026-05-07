import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class CreateFacultyDto {
  @ApiProperty({ example: 'دانشکده مهندسی' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'engineering' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: 'دانشکده مهندسی و فناوری اطلاعات' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateFacultyDto {
  @ApiPropertyOptional({ example: 'دانشکده مهندسی کامپیوتر' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'توضیحات جدید' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateDepartmentDto {
  @ApiProperty({ example: 'گروه مهندسی کامپیوتر' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'computer-science' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: 'گروه مهندسی کامپیوتر و هوش مصنوعی' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateProgramDto {
  @ApiProperty({ example: 'کارشناسی مهندسی کامپیوتر' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'bsc-cs' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: 'برنامه کارشناسی' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'bachelor' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  durationTerms?: number;
}
