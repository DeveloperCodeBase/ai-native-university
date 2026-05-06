# Development Guide

## Main Rule

Code is edited locally on Windows, but runtime and testing must be executed on the Ubuntu VPS.

## Common Commands

From Windows PowerShell in the project root:

```powershell
.\scripts\remote.ps1 status
.\scripts\remote.ps1 up
.\scripts\remote.ps1 logs
.\scripts\remote.ps1 test
.\scripts\remote.ps1 diagnose
.\scripts\remote.ps1 health
.\scripts\remote.ps1 ai-health
.\scripts\remote.ps1 full-check
```

## Development Cycle

1. Edit code locally.
2. Update documentation if behavior, setup, API, env, architecture, or commands changed.
3. Run:

```powershell
.\scripts\remote.ps1 full-check
```

4. Inspect output and logs.
5. If AI code changed, run:

```powershell
.\scripts\remote.ps1 ai-health
```

6. Fix errors locally.
7. Repeat until successful.

## AI Development Rules

When implementing AI features:

1. Use only OpenRouter.
2. Read API key from `OPENROUTER_API_KEY`.
3. Read base URL from `OPENROUTER_BASE_URL`.
4. Read model slugs from:
   - `OPENROUTER_DEFAULT_MODEL`
   - `OPENROUTER_FAST_MODEL`
   - `OPENROUTER_REASONING_MODEL`
5. Never hardcode secrets.
6. Never introduce provider-specific API keys.
7. Update `.env.example` and README.md when AI configuration changes.

## Documentation Rule

Every implementation change must update relevant documentation:

- README.md
- AGENT_RUNBOOK.md
- .env.example
- docs/ARCHITECTURE.md
- docs/DEVELOPMENT.md
- docs/DEPLOYMENT.md
- docs/TROUBLESHOOTING.md
- docs/CHANGELOG.md
