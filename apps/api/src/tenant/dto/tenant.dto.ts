import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'دانشگاه آزاد' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'azad-university' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: 'azad.ac.ir' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ example: 'free' })
  @IsOptional()
  @IsString()
  plan?: string;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'دانشگاه آزاد اسلامی' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'azad.ac.ir' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ example: 'premium' })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}
