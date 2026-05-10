# Contributing Guide

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Run `docker compose up -d --build`
4. Seed database: `docker compose exec api npx prisma db seed`

## Code Structure

```
apps/
├── web/         # Next.js 15 frontend (Persian RTL)
├── api/         # NestJS backend (TypeScript + Prisma)
└── ai-gateway/  # FastAPI AI service gateway (Python)
```

## Development Workflow

1. Create a feature branch from `main`
2. Make changes locally
3. Test via `scripts/remote.ps1 full-check`
4. Submit pull request

## Coding Standards

### TypeScript (NestJS + Next.js)
- Use TypeScript strict mode
- DTOs for all API inputs
- Swagger decorators on all controllers
- Tenant isolation in all service methods

### Python (AI Gateway)
- Pydantic models for all requests/responses
- Type hints on all functions
- Dual-mode support (mock + external_api)

### Frontend
- Persian-first UI labels
- RTL layout by default
- CSS Modules for styling
- `toPersianNum()` for numbers

## Testing

- AI Gateway: `pytest tests/ -v`
- NestJS: `npm test` (planned)
- See `docs/TESTING.md` for full strategy

## Documentation

When adding a module, update:
- `README.md` if setup changes
- `docs/ARCHITECTURE.md` if architecture changes
- `docs/API_REFERENCE.md` if API changes
- `docs/DATA_DICTIONARY.md` if schema changes
- `docs/CHANGELOG.md` always
