# Architecture

This document explains the architecture of AI Native University.

## Runtime Model

- Development and AI coding happen on Windows using Google Antigravity.
- Runtime, Docker, logs, tests, and deployment happen on Ubuntu VPS.
- Source code is synchronized through GitHub.
- The VPS pulls the latest code and runs Docker Compose.

## System Architecture

```text
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  public/index.html (SPA shell)              │
│  public/css/styles.css (design system)      │
│  public/js/app.js (client router + UI)      │
│  marked.js (CDN, markdown rendering)        │
└──────────────────┬──────────────────────────┘
                   │ HTTP / JSON
┌──────────────────▼──────────────────────────┐
│              Express Server                  │
│  server.js                                   │
│  ├─ GET  /health                             │
│  ├─ GET  /api/ai-health                      │
│  ├─ POST /api/chat                           │
│  ├─ GET  /api/courses                        │
│  ├─ GET  /api/courses/:id                    │
│  ├─ GET  /api/courses/:id/lessons/:lid       │
│  ├─ GET  /api/courses/:id/lessons/:lid/quiz  │
│  ├─ POST /api/quiz/evaluate                  │
│  └─ POST /api/tutor/chat                     │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐  ┌───────────┐  ┌──────────┐
│ Data   │  │ OpenRouter │  │ Quiz     │
│ Layer  │  │ Client     │  │ Evaluator│
│courses │  │openrouter  │  │(AI-graded│
│quizzes │  │.js         │  │ answers) │
└────────┘  └─────┬─────┘  └──────────┘
                  │
                  ▼
          OpenRouter API
    https://openrouter.ai/api/v1
```

## Environments

### Local Windows

Used for:

- Editing code
- Running Google Antigravity
- Git commit and push
- Triggering remote commands through `scripts/remote.ps1`

### Ubuntu VPS

Used for:

- Docker build
- Docker run
- Tests
- Logs
- Production-like runtime

## Deployment Flow

1. Code is edited on Windows.
2. Changes are committed and pushed to GitHub.
3. VPS pulls from GitHub.
4. Docker Compose builds and starts services.
5. Logs and health checks are reviewed.
6. Errors are fixed locally and the cycle repeats.

## AI Gateway Architecture

All AI functionality must use OpenRouter as the single AI gateway.

```text
Application
    ↓
OpenRouter-compatible client (src/lib/openrouter.js)
    ↓
https://openrouter.ai/api/v1/chat/completions
    ↓
Selected OpenRouter model slug
```

The codebase must not directly integrate with provider-specific APIs unless the SDK is configured to use OpenRouter's base URL.

Allowed:

- OpenAI-compatible SDK configured with `baseURL=https://openrouter.ai/api/v1`
- Direct HTTP requests to OpenRouter `/api/v1/chat/completions`

Forbidden:

- Direct OpenAI endpoint
- Direct Anthropic endpoint
- Direct Gemini endpoint
- Direct provider-specific API keys

## Frontend Architecture

The frontend is a vanilla JavaScript SPA served as static files:

- **Hash-based routing** — `#/`, `#/courses`, `#/courses/:id`, etc.
- **No build step** — No bundler, transpiler, or framework
- **API-driven** — All data fetched from Express API endpoints
- **Markdown rendering** — Lesson content rendered with marked.js (CDN)
- **Responsive design** — Mobile-first with glassmorphism dark theme

## Data Layer

Phase 1 uses static JavaScript data files (no database):

- `src/data/courses.js` — 3 courses × 3 lessons with full markdown content
- `src/data/quizzes.js` — Multiple-choice and free-text questions per lesson

## Important Constraint

Do not run Google Antigravity agent execution directly on the VPS. The VPS CPU does not expose the required AES instruction for Antigravity language server.
