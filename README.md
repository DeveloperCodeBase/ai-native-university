# 🎓 AI-Native Online University Platform

> **نسل جدید آموزش عالی آنلاین مبتنی بر هوش مصنوعی**

[![Architecture](https://img.shields.io/badge/Architecture-Monorepo-blue)]()
[![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20NestJS%20%7C%20FastAPI-purple)]()
[![AI Mode](https://img.shields.io/badge/AI-Mock%20%7C%20External-green)]()
[![License](https://img.shields.io/badge/License-Private-red)]()

---

## Overview

A production-grade **AI-Native** online university platform where AI is the core learning infrastructure — not an add-on. Features adaptive learning, live classes, intelligent assessment, and cognitive learner profiling.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| 🤖 **AI Tutor** | RAG-based Q&A from course materials |
| 🎥 **Live Classes** | Session management, recording, attendance |
| 📊 **Learning Analytics** | Risk prediction, progress tracking |
| 📝 **Smart Assessment** | AI-assisted grading with human review |
| 🏛️ **University Management** | Faculty, department, program, course structure |
| 🔒 **Multi-Tenant** | Complete data isolation per organization |
| 🌐 **Persian RTL** | First-class Persian/RTL support |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   nginx (:3010)                  │
│        /  → web  │  /api → api  │  /ai → gateway│
├─────────────────────────────────────────────────┤
│  web (Next.js)  │  api (NestJS)  │  ai-gateway  │
│    :3000        │    :4000       │  (FastAPI)    │
│                 │                │    :8000      │
├─────────────────────────────────────────────────┤
│  PostgreSQL 16  │  Redis 7  │  MinIO (S3)       │
│    :5432        │   :6379   │   :9000            │
└─────────────────────────────────────────────────┘
```

### Monorepo Structure

```
ai-native-university/
├── apps/
│   ├── web/          # Next.js 15 — Frontend (RTL)
│   ├── api/          # NestJS — Backend API
│   └── ai-gateway/   # FastAPI — AI Service Gateway
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configurations
├── infra/
│   └── nginx/        # Reverse proxy config
├── docs/             # Documentation
├── _archive/         # Archived MVP code
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
└── AGENTS.md
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **Docker** & **Docker Compose**
- **Python** 3.12+ (for ai-gateway local dev)

### 1. Clone & Setup

```bash
git clone <repo-url> ai-native-university
cd ai-native-university
cp .env.example .env
# Edit .env with your values
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run with Docker Compose

```bash
docker compose up --build
```

### 4. Access

| Service | URL |
|---------|-----|
| 🌐 Web App | http://localhost:3010 |
| 📚 API Swagger | http://localhost:3010/api/docs |
| 🤖 AI Gateway Docs | http://localhost:3010/ai/docs |
| 💾 MinIO Console | http://localhost:9001 |

### 5. Run Database Migration

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

---

## Development

### Local Development (without Docker)

```bash
# Terminal 1 — Start infrastructure
docker compose up postgres redis minio -d

# Terminal 2 — API
cd apps/api && pnpm dev

# Terminal 3 — Web
cd apps/web && pnpm dev

# Terminal 4 — AI Gateway
cd apps/ai-gateway && uvicorn app.main:app --reload --port 8000
```

### Useful Commands

```bash
pnpm dev          # Start all apps in dev mode (via Turborepo)
pnpm build        # Build all apps
pnpm lint         # Lint all apps
pnpm test         # Run all tests
```

---

## AI Gateway

The AI Gateway runs in two modes controlled by `AI_MODE` env variable:

| Mode | Description |
|------|-------------|
| `mock` | Returns realistic mock data. No external calls. Default. |
| `external_api` | Routes to OpenRouter API for real AI responses |

**Note:** When using `external_api` mode, set `OPENROUTER_API_KEY` in `.env`. All AI calls go through OpenRouter only (per AGENT_RUNBOOK.md). Model names are OpenRouter slugs read from env vars.

### Available AI Endpoints

| Endpoint | Mock | External | Description |
|----------|------|----------|-------------|
| `POST /v1/rag/query` | ✅ | ✅ | RAG-based Q&A |
| `POST /v1/class-sessions/{id}/summarize` | ✅ | ✅ | Summarize class |
| `POST /v1/class-sessions/{id}/extract-concepts` | ✅ | ✅ | Extract concepts |
| `POST /v1/class-sessions/{id}/generate-quiz` | ✅ | ✅ | Generate quiz |
| `POST /v1/class-sessions/{id}/analyze` | ✅ | ✅ | Full analysis |
| `POST /v1/assessment/grade-draft` | ✅ | ✅ | AI grading draft |
| `POST /v1/assessment/plagiarism-similarity` | ✅ | — | Plagiarism check |
| `POST /v1/learning-risk/predict` | ✅ | ✅ | Risk prediction |
| `POST /v1/asr/jobs` | ✅ | — | Speech-to-text |
| `POST /v1/embeddings/batch` | ✅ | — | Text embeddings |

---

## Backend API Modules

| Module | Base Path | Key Operations |
|--------|-----------|----------------|
| Auth | `/api/auth` | Login, register, refresh token |
| Tenants | `/api/tenants` | CRUD (super_admin only) |
| Users | `/api/users` | Tenant-scoped CRUD |
| Faculties | `/api/faculties` | Faculty, Department, Program CRUD |
| Courses | `/api/courses` | Course, Module, Lesson, Instructor CRUD |
| Enrollments | `/api/enrollments` | Enroll, progress, status |
| Class Sessions | `/api/class-sessions` | Sessions, attendance, recordings |
| Assessments | `/api/assessments` | Quizzes, questions, submissions, grading |
| Analytics | `/api/analytics` | Events, progress, risk score |
| AI | `/api/ai` | RAG tutor, class analysis, AI logs |

---

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page (Persian RTL, glassmorphism) |
| `/login` | Login with demo credentials |
| `/courses` | Course catalog (search, filter) |
| `/courses/[slug]` | Course detail + enrollment |
| `/tutor` | AI Tutor chat (RAG, governance metadata) |
| `/sessions` | Class sessions list + join/attendance |
| `/dashboard/admin` | Admin analytics dashboard |
| `/dashboard/instructor` | Instructor course dashboard |
| `/dashboard/student` | Student progress dashboard |

---

## Documentation

| File | Description |
|------|-------------|
| `docs/ARCHITECTURE.md` | System architecture & module layout |
| `docs/DEPLOYMENT.md` | Docker deployment guide |
| `docs/DEVELOPMENT.md` | Development setup & workflow |
| `docs/CHANGELOG.md` | Version history |
| `docs/TROUBLESHOOTING.md` | Common issues & fixes |
| `docs/DATA_DICTIONARY.md` | Database schema & entity definitions |
| `docs/API_REFERENCE.md` | Full API endpoint reference |
| `docs/TESTING.md` | Test strategy & coverage |

---

## VPS Deployment

Per `AGENT_RUNBOOK.md`, deploy via:

```powershell
.\scripts\remote.ps1
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, CSS Modules |
| Backend | NestJS 11, Prisma 6, PostgreSQL 16 |
| AI Gateway | FastAPI, Pydantic, httpx |
| Queue | Redis + BullMQ |
| Storage | MinIO (S3-compatible) |
| Proxy | Nginx |
| Container | Docker Compose |
| Monorepo | pnpm workspaces + Turborepo |

---

## License

Private — All rights reserved.
