import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAssessmentDto,
  UpdateAssessmentDto,
  CreateQuestionDto,
  CreateSubmissionDto,
  GradeSubmissionDto,
} from './dto/assessment.dto';

@Injectable()
export class AssessmentService {
  constructor(private prisma: PrismaService) {}

  // --- Assessment CRUD ---

  async create(tenantId: string, userId: string, dto: CreateAssessmentDto) {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, tenantId },
    });
    if (!course) {
      throw new NotFoundException('درس یافت نشد');
    }

    return this.prisma.assessment.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
        type: dto.type || 'quiz',
        totalPoints: dto.totalPoints || 100,
        passingScore: dto.passingScore,
        timeLimit: dto.timeLimit,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        createdBy: userId,
      },
      include: {
        _count: { select: { questions: true, submissions: true } },
      },
    });
  }

  async findByCourse(tenantId: string, courseId: string) {
    return this.prisma.assessment.findMany({
      where: { tenantId, courseId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { questions: true, submissions: true } },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    const assessment = await this.prisma.assessment.findFirst({
      where: { id, tenantId },
      include: {
        course: { select: { id: true, title: true } },
        questions: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { submissions: true } },
      },
    });
    if (!assessment) {
      throw new NotFoundException('آزمون یافت نشد');
    }
    return assessment;
  }

  async update(tenantId: string, id: string, dto: UpdateAssessmentDto) {
    const assessment = await this.prisma.assessment.findFirst({
      where: { id, tenantId },
    });
    if (!assessment) {
      throw new NotFoundException('آزمون یافت نشد');
    }
    return this.prisma.assessment.update({
      where: { id },
      data: dto,
    });
  }

  // --- Questions ---

  async addQuestion(tenantId: string, assessmentId: string, dto: CreateQuestionDto) {
    const assessment = await this.prisma.assessment.findFirst({
      where: { id: assessmentId, tenantId },
    });
    if (!assessment) {
      throw new NotFoundException('آزمون یافت نشد');
    }

    return this.prisma.question.create({
      data: {
        assessmentId,
        type: dto.type,
        stem: dto.stem,
        choices: dto.choices as any,
        correctAnswer: dto.correctAnswer,
        points: dto.points || 1,
        difficulty: dto.difficulty,
        sortOrder: dto.sortOrder || 0,
      },
    });
  }

  async findQuestions(tenantId: string, assessmentId: string) {
    const assessment = await this.prisma.assessment.findFirst({
      where: { id: assessmentId, tenantId },
    });
    if (!assessment) {
      throw new NotFoundException('آزمون یافت نشد');
    }

    return this.prisma.question.findMany({
      where: { assessmentId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // --- Submissions ---

  async submit(tenantId: string, assessmentId: string, userId: string, dto: CreateSubmissionDto) {
    const assessment = await this.prisma.assessment.findFirst({
      where: { id: assessmentId, tenantId },
    });
    if (!assessment) {
      throw new NotFoundException('آزمون یافت نشد');
    }
    if (!assessment.isPublished) {
      throw new ForbiddenException('این آزمون هنوز منتشر نشده');
    }

    // Count existing attempts
    const attemptCount = await this.prisma.submission.count({
      where: { assessmentId, userId },
    });

    // Auto-grade MCQ
    let autoScore: number | null = null;
    const questions = await this.prisma.question.findMany({
      where: { assessmentId },
    });

    if (questions.every((q) => q.type === 'multiple_choice' || q.type === 'true_false')) {
      autoScore = 0;
      for (const answer of dto.answers) {
        const question = questions.find((q) => q.id === answer.questionId);
        if (question) {
          const choices = question.choices as any[];
          if (choices) {
            const correct = choices.find((c: any) => c.isCorrect);
            if (correct && answer.answer === correct.id) {
              autoScore += question.points;
            }
          } else if (question.correctAnswer && answer.answer === question.correctAnswer) {
            autoScore += question.points;
          }
        }
      }
    }

    return this.prisma.submission.create({
      data: {
        assessmentId,
        userId,
        attemptNo: attemptCount + 1,
        answers: dto.answers as any,
        score: autoScore,
        aiDraftScore: autoScore,
        status: autoScore !== null ? 'graded' : 'submitted',
        humanReviewRequired: autoScore === null,
      },
    });
  }

  async findSubmissions(tenantId: string, assessmentId: string) {
    const assessment = await this.prisma.assessment.findFirst({
      where: { id: assessmentId, tenantId },
    });
    if (!assessment) {
      throw new NotFoundException('آزمون یافت نشد');
    }

    return this.prisma.submission.findMany({
      where: { assessmentId },
      orderBy: { submittedAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async findMySubmissions(assessmentId: string, userId: string) {
    return this.prisma.submission.findMany({
      where: { assessmentId, userId },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async gradeSubmission(tenantId: string, submissionId: string, graderId: string, dto: GradeSubmissionDto) {
    const submission = await this.prisma.submission.findFirst({
      where: {
        id: submissionId,
        assessment: { tenantId },
      },
    });
    if (!submission) {
      throw new NotFoundException('پاسخ‌نامه یافت نشد');
    }

    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: dto.score,
        feedback: dto.feedback,
        status: 'graded',
        gradedAt: new Date(),
        gradedBy: graderId,
        humanReviewRequired: false,
      },
    });
  }
}
