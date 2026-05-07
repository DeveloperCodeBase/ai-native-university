# Development Guide

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **Docker** & **Docker Compose**
- **Python** 3.12+ (for ai-gateway local dev)

## Setup

```bash
git clone <repo-url> ai-native-university
cd ai-native-university
pnpm install
cp .env.example .env
# Edit .env with your values
```

## Running Locally

### Option 1: Full Docker Stack

```bash
docker compose up --build
```

Access at http://localhost:3010

### Option 2: Local Development (hot reload)

```bash
# Terminal 1 — Infrastructure
docker compose up postgres redis minio -d

# Terminal 2 — API (NestJS)
cd apps/api && pnpm dev

# Terminal 3 — Web (Next.js)
cd apps/web && pnpm dev

# Terminal 4 — AI Gateway (FastAPI)
cd apps/ai-gateway && uvicorn app.main:app --reload --port 8000
```

## Database

```bash
# Generate Prisma client
cd apps/api && npx prisma generate

# Run migrations
cd apps/api && npx prisma migrate deploy

# Seed demo data
cd apps/api && npx prisma db seed

# Open Prisma Studio
cd apps/api && npx prisma studio
```

## API Module Structure

Each NestJS module follows this pattern:

```
src/<module>/
├── dto/
│   └── <module>.dto.ts        # Request DTOs with class-validator + Swagger
├── <module>.controller.ts     # REST endpoints with guards + decorators
├── <module>.service.ts        # Business logic with tenant isolation
└── <module>.module.ts         # NestJS module wiring
```

### Available Modules

| Module | Endpoints | Auth | Description |
|--------|-----------|------|-------------|
| Auth | 3 | No | Login, register, refresh |
| Tenants | 4 | super_admin | Multi-tenant CRUD |
| Users | 3 | admin | User management |
| Faculties | 7 | admin/auth | Faculty, Department, Program |
| Courses | 8+ | admin/instructor | Course, Module, Lesson, Instructor |
| Enrollments | 5 | auth | Enroll, progress, status |
| ClassSessions | 7 | auth | Sessions, attendance, recordings |
| Assessments | 8 | auth | Quizzes, questions, submissions |
| Analytics | 7 | auth | Events, progress, risk score |
| AI | 6 | auth | RAG tutor, class analysis, logs |

## Frontend Structure

```
apps/web/app/
├── lib/
│   └── api.ts               # Shared API client
├── courses/
│   ├── page.tsx              # Course catalog
│   └── [slug]/
│       └── page.tsx          # Course detail
├── tutor/
│   └── page.tsx              # AI Tutor chat
├── dashboard/
│   ├── admin/page.tsx
│   ├── instructor/page.tsx
│   └── student/page.tsx
├── login/page.tsx
└── page.tsx                  # Landing page
```

## Build Verification

```bash
# Type-check API
cd apps/api && npx tsc --noEmit

# Build frontend
cd apps/web && npx next build
```

## Demo Credentials

| Role | Email | Password | Tenant |
|------|-------|----------|--------|
| Super Admin | superadmin@demo.university.ir | Demo@1234 | demo-university |
| Admin | admin@demo.university.ir | Demo@1234 | demo-university |
| Instructor | instructor@demo.university.ir | Demo@1234 | demo-university |
| Student | student@demo.university.ir | Demo@1234 | demo-university |
| Student 2 | student2@demo.university.ir | Demo@1234 | demo-university |

## Code Style

- TypeScript strict mode
- class-validator for DTO validation
- Swagger decorators on all endpoints
- Persian error messages in services
- Tenant isolation in all service methods
- RBAC guards on all controllers
