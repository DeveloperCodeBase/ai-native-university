# Deployment Guide

## Server

- IP: 193.163.201.141
- SSH alias: my-vps
- User: ubuntu
- Project path: /var/www/ai-native-university
- Public URL: http://193.163.201.141:3010

## Deploy

From Windows PowerShell:

```powershell
.\scripts\remote.ps1 up
```

## Restart

```powershell
.\scripts\remote.ps1 restart
```

## Clean Rebuild

```powershell
.\scripts\remote.ps1 rebuild-clean
```

## View Logs

```powershell
.\scripts\remote.ps1 logs
```

## Live Logs

```powershell
.\scripts\remote.ps1 logs-live
```

## Full Check

```powershell
.\scripts\remote.ps1 full-check
```

## Run Tests

```powershell
.\scripts\remote.ps1 test
```

Tests run inside the Docker container against the live server using Node.js built-in test runner.

## Environment File

The real `.env` file lives only on the server and must not be committed to GitHub.

If `.env` is missing, it can be created from `.env.example`:

```powershell
.\scripts\remote.ps1 env-create
```

After creation, secrets must be reviewed manually on the server.

## OpenRouter Setup

The Ubuntu VPS `.env` file must contain:

```env
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=openai/gpt-5.3-codex
OPENROUTER_FAST_MODEL=openai/gpt-5.3-codex
OPENROUTER_REASONING_MODEL=openai/gpt-5.3-codex
OPENROUTER_HTTP_REFERER=http://193.163.201.141:3010
OPENROUTER_X_TITLE=AI Native University
```

Never commit the real OpenRouter API key.

If AI calls fail:

1. Check `.env` on the server.
2. Check `OPENROUTER_API_KEY`.
3. Check model slugs.
4. Run:

```powershell
.\scripts\remote.ps1 logs
.\scripts\remote.ps1 diagnose
```

## Docker Configuration

Container mapping: host port 3010 → container port 3000.

The Dockerfile uses `npm ci --omit=dev` for reproducible production builds.

## Exposed Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Frontend SPA |
| GET | /health | Health check |
| GET | /api/ai-health | AI health (OpenRouter) |
| POST | /api/chat | Basic chat |
| GET | /api/courses | Course list |
| GET | /api/courses/:id | Course detail |
| GET | /api/courses/:id/lessons/:lid | Lesson content |
| GET | /api/courses/:id/lessons/:lid/quiz | Quiz questions |
| POST | /api/quiz/evaluate | Quiz grading |
| POST | /api/tutor/chat | AI tutor chat |
