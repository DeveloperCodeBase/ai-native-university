# AI Governance

## Principles

1. **Transparency**: All AI responses include source model, provider, confidence score, and human review requirement
2. **Human-in-the-loop**: AI never makes final grading or disciplinary decisions
3. **Auditability**: Every AI interaction is logged in `ai_interaction_logs` table
4. **Explainability**: AI risk assessments include contributing factors and recommendations

## AI Response Metadata

Every AI response includes:

| Field | Type | Description |
|-------|------|-------------|
| model | string | AI model name (OpenRouter slug) |
| provider | string | "mock" or "openrouter" |
| confidence | float | 0.0 – 1.0 |
| humanReviewRequired | boolean | Must a human verify this? |
| correlationId | string | Request tracking ID |

## Human Review Requirements

| AI Function | Auto-Allowed | Human Review Required |
|-------------|-------------|----------------------|
| RAG Q&A (tutor) | ✅ | Only for low confidence (<0.5) |
| Class summarization | — | ✅ Always |
| Concept extraction | — | ✅ Always |
| Quiz generation | — | ✅ Always |
| Grade draft | — | ✅ Always (never final) |
| Risk prediction | — | ✅ Always |
| Plagiarism check | — | ✅ Always |

## Logging & Audit

All AI interactions are stored in the `AiInteractionLog` entity:
- Tenant-scoped
- User who triggered the request
- Input/output summaries
- Model, provider, latency
- Human review flag

Admins can view logs at `GET /api/ai/logs`.

## Model Provider Rules

Per AGENT_RUNBOOK.md:
- All AI calls go through **OpenRouter only**
- No direct OpenAI, Anthropic, Gemini, or other provider keys
- Model names are OpenRouter slugs from env vars
- API keys never hardcoded

## Risk Mitigation

- AI outputs are clearly labeled as AI-generated
- Grade suggestions are always "draft" — instructor must finalize
- Risk scores include "بررسی توسط مشاور تحصیلی توصیه می‌شود"
- Bias monitoring planned for future phases
