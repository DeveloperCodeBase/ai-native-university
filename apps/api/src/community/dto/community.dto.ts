import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateThreadDto {
  @ApiProperty({ description: 'عنوان موضوع', example: 'سوال درباره فصل ۳' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'متن موضوع', example: 'لطفا مفهوم RAG را توضیح دهید' })
  @IsString()
  body: string;
}

export class CreateReplyDto {
  @ApiProperty({ description: 'متن پاسخ', example: 'RAG مخفف Retrieval Augmented Generation است.' })
  @IsString()
  body: string;
}

export class ThreadQueryDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsString()
  pageSize?: string;

  @ApiPropertyOptional({ description: 'جستجو در عنوان و متن' })
  @IsOptional()
  @IsString()
  search?: string;
}
