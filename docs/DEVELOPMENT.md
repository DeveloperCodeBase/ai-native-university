# Development Guide

## Main Rule

Code is edited locally on Windows, but runtime and testing must be executed on the Ubuntu VPS.

## Project Structure

```text
ai-native-university/
├── server.js                 # Express server entry point
├── package.json
├── Dockerfile
├── docker-compose.yml
├── public/                   # Static frontend (served by Express)
│   ├── index.html            # SPA shell
│   ├── css/styles.css        # Design system
│   └── js/app.js             # Client SPA router and logic
├── src/
│   ├── data/
│   │   ├── courses.js        # Course catalog data
│   │   └── quizzes.js        # Quiz data per lesson
│   ├── lib/
│   │   └── openrouter.js     # OpenRouter API client
│   └── routes/
│       ├── courses.js        # Course/lesson API routes
│       ├── tutor.js          # AI tutor chat routes
│       └── quiz.js           # Quiz evaluation routes
├── tests/
│   └── api.test.js           # API endpoint tests
├── scripts/
│   └── remote.ps1            # Remote deployment script
└── docs/                     # Documentation
```

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

## Adding a New Course

1. Add course object to `src/data/courses.js` with `id`, `title`, `description`, `category`, `difficulty`, `icon`, `color`, `estimatedHours`, and `lessons[]`.
2. Add quiz data for each lesson in `src/data/quizzes.js`.
3. The frontend and API will automatically pick up the new course.

## Adding a New API Endpoint

1. Create or modify route file in `src/routes/`.
2. Mount the router in `server.js`.
3. Add tests in `tests/api.test.js`.
4. Update API documentation in README.md.

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
