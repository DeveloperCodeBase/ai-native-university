# Deployment Guide

## Server Requirements

- Ubuntu 22.04+ VPS
- Docker & Docker Compose v2
- Git
- 4GB+ RAM recommended
- No GPU required (AI runs in mock mode or via external API)

## Server Info

- SSH alias: `my-vps`
- IP: `193.163.201.141`
- Remote path: `/var/www/ai-native-university`
- Public URL: `http://193.163.201.141:3010`

## Deployment Workflow

All deployment commands run from Windows via `scripts/remote.ps1`:

```powershell
# First-time setup
.\scripts\remote.ps1 bootstrap-server

# Deploy (build + start)
.\scripts\remote.ps1 up

# Full deploy with health check
.\scripts\remote.ps1 full-check

# Run database migration
.\scripts\remote.ps1 db-migrate

# Seed demo data
.\scripts\remote.ps1 db-seed

# View logs
.\scripts\remote.ps1 logs

# Check health
.\scripts\remote.ps1 health

# Check AI health
.\scripts\remote.ps1 ai-health
```

## Environment Variables

The `.env` file exists only on the VPS. Create it from `.env.example`:

```powershell
.\scripts\remote.ps1 env-create
```

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `ainu` |
| `POSTGRES_PASSWORD` | Database password | `ainu_secret` |
| `POSTGRES_DB` | Database name | `ainu_db` |
| `DATABASE_URL` | Full Postgres connection string | (composed from above) |
| `REDIS_PASSWORD` | Redis password | `ainu_redis_secret` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | change-me |
| `AI_MODE` | `mock` or `external_api` | `mock` |
| `AI_GATEWAY_URL` | AI Gateway internal URL | `http://ai-gateway:8000` |
| `AI_GATEWAY_API_KEY` | API key for gateway auth | change-me |
| `OPENROUTER_API_KEY` | OpenRouter API key | empty |
| `OPENROUTER_BASE_URL` | OpenRouter base URL | `https://openrouter.ai/api/v1` |
| `OPENROUTER_DEFAULT_MODEL` | Default model slug | `openai/gpt-4o-mini` |
| `EXTERNAL_PORT` | Public port | `3010` |

### Docker Networking Note

Inside Docker, services communicate via Docker DNS:
- API → AI Gateway: `http://ai-gateway:8000`
- Web → API: Uses nginx proxy `/api` → `http://api:4000`
- Web → AI Gateway: Uses nginx proxy `/ai` → `http://ai-gateway:8000`

## Ports

| Port | Service | Exposed |
|------|---------|---------|
| 3010 | nginx (public) | Yes |
| 3000 | web (internal) | Docker only |
| 4000 | api (internal) | Docker only |
| 8000 | ai-gateway (internal) | Docker only |
| 5432 | postgres (internal) | Docker only |
| 6379 | redis (internal) | Docker only |
| 9000 | minio (internal) | Docker only |

## Post-Deploy Verification

After `.\scripts\remote.ps1 up`:

1. Check containers: `.\scripts\remote.ps1 status`
2. Check API health: `.\scripts\remote.ps1 health`
3. Check AI health: `.\scripts\remote.ps1 ai-health`
4. Check logs: `.\scripts\remote.ps1 logs`
5. Run migration: `.\scripts\remote.ps1 db-migrate`
6. Seed data: `.\scripts\remote.ps1 db-seed`

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
