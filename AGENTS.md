# Agent Rules for AI-Native Online University

## Product Principle

This is an AI-Native Online University, not a simple LMS.

## Language

- Persian-first UX
- RTL by default
- English technical naming in code is allowed
- UI labels must support i18n

## Architecture

- Use modular monorepo
- Keep domain logic in backend services
- Do not put business logic only in frontend
- AI must be behind ai-gateway
- Heavy AI must be external API only
- No local GPU dependency

## AI Provider Rule

- All AI model calls must use OpenRouter only
- Use only `OPENROUTER_API_KEY` and `OPENROUTER_BASE_URL`
- Never hardcode model names or API keys in source code

## Security

- Never hardcode secrets
- Never commit .env
- Enforce tenant isolation
- Enforce RBAC
- Log sensitive actions
- AI output must be auditable

## AI Governance

- Every AI response must include:
  - source/context when available
  - confidence
  - model/provider
  - humanReviewRequired
- Do not make final grading or disciplinary decisions automatically

## Documentation

Every new module must update:

- README if setup changes
- docs/architecture if architecture changes
- OpenAPI if API changes
- DATA_DICTIONARY if schema changes
- TESTING if tests change

## Testing

- Add unit tests for services
- Add integration tests for APIs
- Add E2E tests for critical flows
