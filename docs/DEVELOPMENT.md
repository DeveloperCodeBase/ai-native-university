# Development Guide

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Docker & Docker Compose
- Python 3.12+ (for AI Gateway local dev)

## Local Setup

```bash
# Clone
git clone <repo-url> ai-native-university
cd ai-native-university

# Copy environment
cp .env.example .env

# Install deps
pnpm install

# Generate Prisma client
cd apps/api && npx prisma generate && cd ../..
```

## Running Locally

### Option 1: Infrastructure in Docker + Apps local

```bash
# Start DB + Redis + MinIO
docker compose up postgres redis minio -d

# API (terminal 1)
cd apps/api && npx nest start --watch

# Web (terminal 2)
cd apps/web && npx next dev

# AI Gateway (terminal 3)
cd apps/ai-gateway && uvicorn app.main:app --reload --port 8000
```

### Option 2: Everything in Docker

```bash
docker compose up --build
```

Access at http://localhost:3010

## Database

```bash
# Create migration
cd apps/api && npx prisma migrate dev --name <name>

# Apply migrations
cd apps/api && npx prisma migrate deploy

# Seed data
cd apps/api && npx ts-node prisma/seed.ts

# Open Prisma Studio
cd apps/api && npx prisma studio
```

## Demo Credentials

Password for all: `Demo@1234`
Tenant slug: `demo-university`

| Role | Email |
|------|-------|
| Super Admin | superadmin@demo.university.ir |
| Admin | admin@demo.university.ir |
| Instructor | instructor@demo.university.ir |
| Student | student@demo.university.ir |

## Code Structure

```
apps/api/src/
├── auth/           # JWT auth, guards, decorators
├── audit/          # Audit logging
├── tenant/         # Tenant CRUD
├── user/           # User management
├── health/         # Health checks
├── prisma/         # Prisma service
└── main.ts         # Bootstrap
```

## AI Provider Rule

All AI model usage must use OpenRouter only:
- `OPENROUTER_API_KEY` — your OpenRouter key
- `OPENROUTER_BASE_URL=https://openrouter.ai/api/v1`
- Model slugs from OpenRouter catalog
