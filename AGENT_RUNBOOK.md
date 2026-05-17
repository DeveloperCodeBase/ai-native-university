# Agent Runbook

This file is mandatory for claude agent. Read it before doing any task.

## Role

You are the implementation agent for AI Native University.

You code locally on Windows, but all runtime, Docker, logs, tests, diagnostics, environment bootstrapping, AI health checks, and deployment must run on the Ubuntu VPS through `scripts/remote.ps1`.

## Hard Rules

1. Do not run production Docker commands directly on Windows.
2. Do not use claude Remote-SSH agent execution directly on the VPS.
3. Do not commit real secrets.
4. Never commit `.env`.
5. Always keep `.env.example` updated.
6. Always keep README and docs updated with implementation changes.
7. Every feature must be tested remotely on the Ubuntu VPS.
8. Every error must be diagnosed through logs, fixed locally, committed, pushed, redeployed, and tested again.
9. Do not mark a task complete before remote deploy/test/log/health checks pass.

## AI Model Provider Rule

All AI model usage in this project must go through OpenRouter only.

Hard requirements:

1. Do not use direct OpenAI API keys.
2. Do not use direct Anthropic API keys.
3. Do not use direct Gemini / Google AI API keys.
4. Do not use direct Groq, Together, Mistral, Cohere, or provider-specific API keys.
5. Use only `OPENROUTER_API_KEY`.
6. Use only `OPENROUTER_BASE_URL=https://openrouter.ai/api/v1`.
7. Model names must be OpenRouter model slugs.
8. If a new model is needed, choose a valid model slug from OpenRouter and document it in `.env.example`, README.md, and docs.
9. Never hardcode model names or API keys in source code. Read them from environment variables.

## Server

- SSH alias: `my-vps`
- IP: `193.163.201.141`
- User: `ubuntu`
- Remote path: `/var/www/ai-native-university`
- Public URL: `http://193.163.201.141:3010`

## Required Commands

Use these from Windows PowerShell in the project root:

```powershell
.\scripts\remote.ps1 status
.\scripts\remote.ps1 bootstrap-server
.\scripts\remote.ps1 env-check
.\scripts\remote.ps1 env-create
.\scripts\remote.ps1 up
.\scripts\remote.ps1 restart
.\scripts\remote.ps1 logs
.\scripts\remote.ps1 logs-live
.\scripts\remote.ps1 test
.\scripts\remote.ps1 diagnose
.\scripts\remote.ps1 health
.\scripts\remote.ps1 ai-health
.\scripts\remote.ps1 full-check
```

## Standard Implementation Workflow

For every meaningful change:

1. Inspect existing code and docs.
2. Update implementation locally.
3. Update or create tests when applicable.
4. Update `.env.example` if any environment variable is added, removed, or changed.
5. Update README.md if setup, usage, scripts, ports, services, or behavior changes.
6. Update relevant docs in `/docs`.
7. Update `docs/CHANGELOG.md`.
8. Run:

```powershell
.\scripts\remote.ps1 full-check
```

9. If AI code changed, run:

```powershell
.\scripts\remote.ps1 ai-health
```

10. Read logs and health output.
11. If there is an error:
    - inspect logs with `.\scripts\remote.ps1 logs`
    - inspect diagnostics with `.\scripts\remote.ps1 diagnose`
    - fix code locally
    - repeat the workflow
12. Only finish when deployment, logs, tests, and health checks are successful.

## Documentation Requirements

Always keep these files updated:

- README.md
- AGENT_RUNBOOK.md
- .env.example
- docs/ARCHITECTURE.md
- docs/DEVELOPMENT.md
- docs/DEPLOYMENT.md
- docs/TROUBLESHOOTING.md
- docs/CHANGELOG.md

## Environment Management

The real `.env` file exists only on the Ubuntu VPS.

If `.env` is missing, create it from `.env.example` using:

```powershell
.\scripts\remote.ps1 env-create
```

If new env variables are needed:

1. Add them to `.env.example`.
2. Document them in README.md.
3. Document them in docs/DEPLOYMENT.md.
4. If the value is non-secret and safe, provide default.
5. If the value is secret, use an empty placeholder and explain it.

## Completion Criteria

A task is complete only when:

- Code is implemented.
- Documentation is updated.
- `.env.example` is updated if needed.
- Changes are committed and pushed.
- Server has pulled the latest code.
- Docker build succeeds.
- App starts successfully.
- Logs do not show blocking errors.
- Tests pass where applicable.
- Health check passes.
