# Architecture Overview

## System Architecture

```
┌───────────────────────────────────────────────────────┐
│                   nginx (:3010)                        │
│    /  → web   │   /api → api   │   /ai → ai-gateway  │
├───────────────────────────────────────────────────────┤
│  web (Next.js 15)  │  api (NestJS 11)  │  ai-gateway │
│     :3000          │     :4000         │  (FastAPI)   │
│                    │                   │    :8000     │
├───────────────────────────────────────────────────────┤
│  PostgreSQL 16  │  Redis 7  │  MinIO (S3-compatible)  │
│     :5432       │   :6379   │   :9000                 │
└───────────────────────────────────────────────────────┘
```

## Services

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| `web` | Next.js 15, React 19 | 3000 | Frontend (Persian RTL) |
| `api` | NestJS 11, Prisma, PostgreSQL | 4000 | Backend API + Auth + RBAC |
| `ai-gateway` | FastAPI, Pydantic | 8000 | AI service router (mock/external) |
| `postgres` | PostgreSQL 16 | 5432 | Primary database |
| `redis` | Redis 7 | 6379 | Cache, queues |
| `minio` | MinIO | 9000 | S3-compatible file storage |
| `nginx` | Nginx Alpine | 80 (→3010) | Reverse proxy, rate limiting |

## Backend API Modules

| Module | Path | Description |
|--------|------|-------------|
| `AuthModule` | `/api/auth` | JWT login, register, refresh, RBAC |
| `TenantModule` | `/api/tenants` | Multi-tenant CRUD (super_admin) |
| `UserModule` | `/api/users` | User management (tenant-scoped) |
| `AuditModule` | — | Audit logging service |
| `FacultyModule` | `/api/faculties` | Faculty, Department, Program CRUD |
| `CourseModule` | `/api/courses` | Course, Module, Lesson, Instructor CRUD |
| `EnrollmentModule` | `/api/enrollments` | Enrollment, progress, status |
| `ClassSessionModule` | `/api/class-sessions` | Sessions, attendance, recordings |
| `AssessmentModule` | `/api/assessments` | Quizzes, questions, submissions, grading |
| `AnalyticsModule` | `/api/analytics` | Events, progress, risk score |
| `AiModule` | `/api/ai` | RAG tutor, class analysis, AI logs |

## Frontend Pages

| Route | Auth | Description |
|-------|------|-------------|
| `/` | No | Landing page |
| `/login` | No | Login with demo credentials |
| `/courses` | No | Public course catalog |
| `/courses/[slug]` | No | Course detail + enrollment |
| `/tutor` | Yes | AI Tutor chat (RAG) |
| `/dashboard/admin` | Yes (admin) | Admin analytics dashboard |
| `/dashboard/instructor` | Yes (instructor) | Instructor course dashboard |
| `/dashboard/student` | Yes (student) | Student progress dashboard |

## AI Architecture

All AI calls go through the AI Gateway. Two modes:

- **`mock`** — Returns realistic Persian mock data. No external API calls.
- **`external_api`** — Routes to OpenRouter or `AI_SERVICES_BASE_URL`.

All AI model calls use **OpenRouter only** (per AGENT_RUNBOOK.md).

### AI Governance

Every AI response includes:
- `confidence` — Float 0-1
- `model` — Model slug used
- `provider` — Provider name
- `humanReviewRequired` — Boolean flag

Every AI interaction is logged to `AiInteractionLog` table with:
- correlationId, latencyMs, inputSummary, outputSummary
- Linked to user and tenant

## Data Model

22 Prisma entities:

- **Auth**: Tenant, User, AuditLog
- **Academic**: Faculty, Department, Program, Course, CourseModule, Lesson, CourseInstructor
- **Enrollment**: Enrollment
- **Live Class**: ClassSession, Attendance, ChatMessage, Recording
- **Assessment**: Assessment, Question, Submission
- **Certificate**: Certificate
- **Analytics**: LearningEvent
- **AI**: AiInteractionLog

## Multi-Tenancy

Row-level isolation via `tenantId` foreign key on all tenant-scoped entities. Enforced by:
- `TenantGuard` in NestJS
- Prisma queries always filter by `tenantId`
- JWT payload includes `tenantId`

## Authentication

- JWT-based (access + refresh tokens)
- Roles: `super_admin`, `admin`, `instructor`, `student`, `teaching_assistant`
- `RolesGuard` enforces RBAC
- `super_admin` bypasses all role and tenant checks
