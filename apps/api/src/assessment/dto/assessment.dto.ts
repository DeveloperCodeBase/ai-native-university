import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// --- Assessment ---

export class CreateAssessmentDto {
  @ApiProperty({ description: 'شناسه درس' })
  @IsString()
  courseId: string;

  @ApiProperty({ example: 'آزمون میان‌ترم هوش مصنوعی' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'quiz' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  totalPoints?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  passingScore?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  timeLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateAssessmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalPoints?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  passingScore?: number;
}

// --- Question ---

export class ChoiceDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 'multiple_choice' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Overfitting چه زمانی رخ می‌دهد؟' })
  @IsString()
  stem: string;

  @ApiPropertyOptional({ type: [ChoiceDto] })
  @IsOptional()
  @IsArray()
  choices?: ChoiceDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  points?: number;

  @ApiPropertyOptional({ example: 'medium' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

// --- Submission ---

export class SubmitAnswerDto {
  @ApiProperty()
  @IsString()
  questionId: string;

  @ApiProperty()
  answer: any;
}

export class CreateSubmissionDto {
  @ApiProperty({ type: [SubmitAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers: SubmitAnswerDto[];
}

export class GradeSubmissionDto {
  @ApiProperty({ example: 85 })
  @IsNumber()
  score: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;
}
