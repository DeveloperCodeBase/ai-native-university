# Architecture

This document explains the architecture of AI Native University.

## Runtime Model

- Development and AI coding happen on Windows using Google Antigravity.
- Runtime, Docker, logs, tests, and deployment happen on Ubuntu VPS.
- Source code is synchronized through GitHub.
- The VPS pulls the latest code and runs Docker Compose.

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
OpenRouter-compatible client
    ↓
https://openrouter.ai/api/v1
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

## Important Constraint

Do not run Google Antigravity agent execution directly on the VPS. The VPS CPU does not expose the required AES instruction for Antigravity language server.
