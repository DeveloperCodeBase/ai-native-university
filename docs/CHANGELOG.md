# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-05-07

### Added — Phase 1: Repository Scaffold
- Monorepo structure with pnpm workspaces + Turborepo
- Next.js 15 frontend (`apps/web`) with Persian RTL, Vazirmatn font
- NestJS 11 backend (`apps/api`) with Swagger/OpenAPI
- FastAPI AI Gateway (`apps/ai-gateway`) with mock mode
- Shared packages: `@ainu/types`, `@ainu/ui`, `@ainu/config`
- Docker Compose with 7 services: web, api, ai-gateway, postgres, redis, minio, nginx
- Nginx reverse proxy with rate limiting
- Prisma schema with 22 entities
- Premium dark-mode landing page with glassmorphism design
- Full `.env.example` with all configuration keys

### Added — Phase 2: Authentication & RBAC
- JWT authentication (login, register, refresh token)
- Role-based access control (super_admin, admin, instructor, student, teaching_assistant)
- Tenant isolation guard
- Audit logging service
- Tenant CRUD with slug-based lookup
- User management (tenant-scoped CRUD)
- Database seed script with demo data (5 users, 1 faculty, 3 courses)
- Login page with demo credentials quick-fill
- Role-based dashboards (admin, instructor, student)

### Added — AI Gateway Endpoints
- `POST /v1/rag/query` — RAG-based Q&A (mock)
- `POST /v1/class-sessions/{id}/summarize` — Class summarization (mock)
- `POST /v1/class-sessions/{id}/extract-concepts` — Concept extraction (mock)
- `POST /v1/class-sessions/{id}/generate-quiz` — Quiz generation (mock)
- `POST /v1/class-sessions/{id}/analyze` — Full class analysis (mock)
- `POST /v1/assessment/grade-draft` — AI grading (mock)
- `POST /v1/assessment/plagiarism-similarity` — Plagiarism check (mock)
- `POST /v1/learning-risk/predict` — Student risk prediction (mock)
- `POST /v1/asr/jobs` — Speech-to-text job (mock)
- `POST /v1/embeddings/batch` — Text embeddings (mock)

### Changed
- Archived Express.js MVP to `_archive/`
- Replaced single-service Docker Compose with multi-service
- Updated `scripts/remote.ps1` for new architecture
- Updated all documentation

## [1.0.0] - 2026-05-06

### Initial
- Express.js MVP with 3 courses, basic quizzes, AI tutor via OpenRouter
