import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

interface AiRequestOptions {
  tenantId: string;
  userId: string;
  taskType: string;
  courseId?: string;
  classSessionId?: string;
  correlationId?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly gatewayUrl: string;
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.gatewayUrl = this.configService.get<string>(
      'AI_GATEWAY_URL',
      'http://ai-gateway:8000',
    );
    this.apiKey = this.configService.get<string>(
      'AI_GATEWAY_API_KEY',
      'change-me-gateway-key',
    );
  }

  private async callGateway(path: string, body: any, options: AiRequestOptions) {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.gatewayUrl}/v1${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'X-Correlation-ID': options.correlationId || crypto.randomUUID(),
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      // Log AI interaction
      await this.logInteraction({
        ...options,
        model: data.model || 'unknown',
        provider: data.provider || 'unknown',
        confidence: data.confidence,
        humanReviewRequired: data.human_review_required || data.requiresHumanReview || false,
        latencyMs,
        inputSummary: JSON.stringify(body).substring(0, 500),
        outputSummary: JSON.stringify(data).substring(0, 500),
      });

      return data;
    } catch (error) {
      this.logger.error(`AI Gateway call failed: ${path}`, error);
      throw error;
    }
  }

  private async logInteraction(data: {
    tenantId: string;
    userId: string;
    taskType: string;
    courseId?: string;
    classSessionId?: string;
    model: string;
    provider: string;
    confidence?: number;
    humanReviewRequired: boolean;
    latencyMs: number;
    inputSummary?: string;
    outputSummary?: string;
    correlationId?: string;
  }) {
    try {
      await this.prisma.aiInteractionLog.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          taskType: data.taskType,
          courseId: data.courseId,
          classSessionId: data.classSessionId,
          model: data.model,
          provider: data.provider,
          confidence: data.confidence,
          humanReviewRequired: data.humanReviewRequired,
          latencyMs: data.latencyMs,
          inputSummary: data.inputSummary,
          outputSummary: data.outputSummary,
          correlationId: data.correlationId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log AI interaction', error);
    }
  }

  // --- Public API Methods ---

  async ragQuery(
    query: string,
    options: AiRequestOptions & { courseId?: string; lessonId?: string },
  ) {
    return this.callGateway('/rag/query', {
      query,
      course_id: options.courseId,
      lesson_id: options.lessonId,
      tenant_id: options.tenantId,
      language: 'fa',
    }, { ...options, taskType: 'rag_query' });
  }

  async summarizeSession(sessionId: string, options: AiRequestOptions) {
    return this.callGateway(`/class-sessions/${sessionId}/summarize`, {
      tenant_id: options.tenantId,
      language: 'fa',
    }, { ...options, taskType: 'summarize' });
  }

  async extractConcepts(sessionId: string, options: AiRequestOptions) {
    return this.callGateway(`/class-sessions/${sessionId}/extract-concepts`, {
      tenant_id: options.tenantId,
      language: 'fa',
    }, { ...options, taskType: 'extract_concepts' });
  }

  async generateQuiz(sessionId: string, options: AiRequestOptions) {
    return this.callGateway(`/class-sessions/${sessionId}/generate-quiz`, {
      tenant_id: options.tenantId,
      language: 'fa',
    }, { ...options, taskType: 'generate_quiz' });
  }

  async analyzeSession(sessionId: string, options: AiRequestOptions) {
    return this.callGateway(`/class-sessions/${sessionId}/analyze`, {
      tenant_id: options.tenantId,
      language: 'fa',
      tasks: ['summarize', 'extract_concepts', 'generate_quiz'],
    }, { ...options, taskType: 'analyze_session' });
  }

  async gradeDraft(assessmentData: any, options: AiRequestOptions) {
    return this.callGateway('/assessment/grade-draft', assessmentData, {
      ...options,
      taskType: 'grade_draft',
    });
  }

  async predictLearningRisk(learnerData: any, options: AiRequestOptions) {
    return this.callGateway('/learning-risk/predict', learnerData, {
      ...options,
      taskType: 'learning_risk',
    });
  }

  // --- AI Interaction Logs Query ---

  async getInteractionLogs(tenantId: string, query?: { userId?: string; taskType?: string; limit?: number }) {
    return this.prisma.aiInteractionLog.findMany({
      where: {
        tenantId,
        ...(query?.userId && { userId: query.userId }),
        ...(query?.taskType && { taskType: query.taskType }),
      },
      orderBy: { createdAt: 'desc' },
      take: query?.limit || 50,
      include: {
        user: { select: { id: true, fullName: true } },
      },
    });
  }
}
