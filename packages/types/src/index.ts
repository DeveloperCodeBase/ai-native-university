// ============================================================
// AI-Native Online University — Shared Types
// ============================================================

// --- Enums ---

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  TEACHING_ASSISTANT = 'teaching_assistant',
}

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
}

export enum EnrollmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  WAITLISTED = 'waitlisted',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ClassSessionStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum RecordingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export enum AssessmentType {
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  EXAM = 'exam',
  PROJECT = 'project',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
}

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  GRADING = 'grading',
  GRADED = 'graded',
  RETURNED = 'returned',
}

export enum AiMode {
  MOCK = 'mock',
  EXTERNAL_API = 'external_api',
}

export enum AiTaskType {
  RAG_QUERY = 'rag_query',
  SUMMARIZE = 'summarize',
  EXTRACT_CONCEPTS = 'extract_concepts',
  GENERATE_QUIZ = 'generate_quiz',
  ANALYZE_CLASS = 'analyze_class',
  GRADE_DRAFT = 'grade_draft',
  RISK_PREDICT = 'risk_predict',
  ASR = 'asr',
  EMBEDDING = 'embedding',
}

// --- Interfaces ---

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    traceId?: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface AiResponse {
  jobId?: string;
  status: 'completed' | 'processing' | 'failed';
  result?: unknown;
  confidence?: number;
  model?: string;
  provider?: string;
  humanReviewRequired: boolean;
  sources?: AiSource[];
  processingTimeMs?: number;
}

export interface AiSource {
  type: string;
  id: string;
  title?: string;
  snippet?: string;
  relevanceScore?: number;
}

export interface LearningEventPayload {
  eventType: string;
  tenantId: string;
  actorId: string;
  objectId?: string;
  objectType?: string;
  courseId?: string;
  lessonId?: string;
  classSessionId?: string;
  context?: Record<string, unknown>;
  timestamp: string;
  correlationId?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
  checks?: Record<string, { status: string; responseTime?: number }>;
}
