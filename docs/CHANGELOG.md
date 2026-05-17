# Changelog

All notable changes to this project will be documented in this file.

## [3.1.0] - 2026-05-18

### Added — New Feature Pages

- **`/certificates`**: Student certificate wall — stats bar, animated grid, gold-accented cards, verification link + copy button, verification code display. Auto-issued on enrollment completion via `CertificateService.issueOnCompletion()`.
- **`/analytics`**: Role-adaptive analytics/gradebook — tenant-wide stat cards for admins, two-column gradebook for instructors with course sidebar → assessment accordion → submission table drill-down.
- **`/users`**: Admin user management — paginated searchable table, role filter, create-user modal with fullName/email/password/role fields.
- **`/faculties`**: Faculty & department browser — animated card grid, create-faculty modal for admins, department chip list inside each faculty card.
- **`/notifications`**: Full notification list — per-type icon mapping (Trophy/BookOpen/AlertTriangle/Info), mark-single-read on click, mark-all-read action, unread dot indicator.

### Fixed

- **`Certificate` Prisma model**: Added missing `course Course? @relation(...)` field and inverse `certificates Certificate[]` on `Course` model — resolves TS2353 build errors in `certificate.service.ts`.
- **Migration `20260518_certificate_course_relation`**: Idempotent FK constraint migration applied on VPS.

## [3.0.0] - 2026-05-18

### Changed — Frontend Redesign: Professional University Theme

- **Icons**: Replaced all emoji icons with `lucide-react` SVG icons across every page
- **Shared layout**: New `DashboardLayout` component eliminates per-page sidebar duplication in all dashboard/feature pages
- **Landing page**: Professional hero with trust indicators, stats grid, feature cards, AI showcase, footer
- **Login page**: Password show/hide toggle, demo credential buttons, lucide icons
- **Register page**: Two-panel brand/form layout with feature list
- **Course catalog**: Sticky topbar, search-with-icon, level filter chips, skeleton loading (6 cards), course cards with level badge
- **Course detail page**: Sticky nav, hero layout, module accordion with animation, side stats card — CSS fully migrated to new design tokens
- **Lesson viewer**: Lucide icon sidebar, BrainCircuit AI tutor header, Send icon submit button
- **AI tutor page**: Two-panel layout with governance metadata display (confidence, model, humanReview), BrainCircuit avatars, hint chips
- **Sessions page**: Live-pulse animation for live sessions, status icon mapping
- **Assessment page**: FileText intro icon, Trophy/BookOpen/CheckCircle2 result icons, Send submit button
- **Forum page**: MessageCircle/PenLine/Pin/Lock/ThumbsUp/Send icons throughout
- **Admin/Instructor/Student dashboards**: Metric grids, course lists, system status via `DashboardLayout`
- **NotificationBell**: Bell/BellOff/BookOpen/FileText/Video/Clock/Settings/Bot icons

### Added
- `apps/web/app/components/DashboardLayout.tsx` — shared sidebar + topbar layout component
- `apps/web/app/components/DashboardLayout.module.css`
- `apps/web/app/dashboard/student/student.module.css`
- `apps/web/app/dashboard/admin/admin.module.css`

### Fixed
- CSS typo `--accent-400: #33ebb f` → `--accent-400: #33ebbf`
- Added extensive utility classes: `.metric-card`, `.nav-item`, `.card-icon`, `.empty-state`, `.tag`, etc.
- Added `lucide-react` dependency to `apps/web/package.json`
- `TypeScript`: Fixed `ComponentType<{ size?: number }>` → added `strokeWidth` and `className` to all icon type definitions
- **DB**: Created `notifications` table migration (`20260517_notifications`) — table was defined in Prisma schema but had no migration file

## [2.3.0] - 2026-05-07

### Added — Phase 4: Class Sessions Frontend
- `/sessions` page — Lists all class sessions with status badges, join/attendance buttons, recording indicators
- Persian date formatting with `toLocaleDateString('fa-IR')`
- Session status: scheduled/live/ended/cancelled with visual indicators
- Navigation links updated in student, instructor, and admin dashboards

### Added — Phase 6: Documentation
- `docs/DATA_DICTIONARY.md` — Complete data dictionary with 21 entities, ER diagram, column definitions
- `docs/API_REFERENCE.md` — Full API reference with all endpoints, request/response examples, roles table
- `docs/TESTING.md` — Testing guide with framework info, coverage, strategy, CI/CD

### Changed
- Student dashboard: nav link to `/sessions`
- Instructor dashboard: nav link to `/sessions`
- Admin dashboard: added `/sessions` to sidebar navigation

## [2.2.0] - 2026-05-07

### Added — Phase 3: OpenRouter Integration
- `openrouter_client.py` — Async OpenRouter client for AI Gateway
- All AI routers now support dual-mode: `mock` (default) and `external_api` (OpenRouter)
- RAG query calls OpenRouter with Persian system prompt when `AI_MODE=external_api`
- Class analysis (summarize, concepts, quiz, analyze) calls OpenRouter in external_api mode
- Assessment grading calls OpenRouter with rubric-aware prompting
- Risk prediction calls OpenRouter with educational context

### Added — Tests
- `tests/test_endpoints.py` — 15 tests covering all AI Gateway endpoints in mock mode
- Tests verify correlation ID middleware, AI governance flags, response structure
- pytest added to requirements

### Changed
- All AI routers refactored to separate mock and OpenRouter logic cleanly
- Assessment plagiarism check remains mock-only (needs embedding DB)

## [2.1.0] - 2026-05-07

### Added — Phase 2: Core University Domain API
- Faculty module — CRUD for Faculty, Department, Program (tenant-scoped)
- Course module — CRUD for Course, CourseModule, Lesson, CourseInstructor assignment
- Enrollment module — Student enrollment, progress tracking, status management
- ClassSession module — Session CRUD, attendance (join/leave), recording management
- Assessment module — Assessment, Question, Submission CRUD, auto-grade MCQ, manual grading
- Public course catalog endpoint (no auth required, published courses only)

### Added — Phase 3: AI Integration
- AiService — NestJS client for AI Gateway with automatic AiInteractionLog
- AI controller — RAG tutor, class summarization, concept extraction, quiz generation, logs
- Every AI interaction logged with: confidence, model, provider, latencyMs, humanReviewRequired
- correlationId tracing between API and AI Gateway

### Added — Phase 5: Learning Analytics
- Analytics module — Event ingestion (single + batch), student progress, course analytics
- Tenant analytics dashboard endpoint (admin only)
- Rule-based risk scoring with explicit human review requirement
- toPersianNum utility in frontend for Persian number rendering

### Added — Frontend Pages
- `/courses` — Course catalog with search, level filter, responsive card grid
- `/courses/[slug]` — Course detail with hero, enrollment, module accordion, lesson list
- `/tutor` — AI Tutor chat with course context, confidence/model badges, source citations
- `lib/api.ts` — Shared API client with auth headers, typed helpers
- Student dashboard — fetches real enrollment + analytics data
- Instructor dashboard — fetches real course data with student counts
- Admin dashboard — fetches real tenant analytics with event breakdown

### Changed
- Updated `app.module.ts` to register 7 new domain modules
- Homepage nav links now include Courses catalog
- Hero CTA links updated to Courses and Login
- All dashboards use real API data instead of hardcoded values

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
