# Testing Guide

## Test Infrastructure

| Component | Framework | Location | Run Command |
|-----------|-----------|----------|-------------|
| AI Gateway | pytest | `apps/ai-gateway/tests/` | `pytest tests/ -v` |
| NestJS API | Jest (planned) | `apps/api/test/` | `npm test` |
| Frontend | Next.js (planned) | `apps/web/__tests__/` | `npm test` |

## Running Tests

### AI Gateway Tests (Remote)

```powershell
# Run on VPS via Docker
ssh my-vps "cd /var/www/ai-native-university && docker compose exec ai-gateway pytest tests/ -v"
```

### Test Coverage

#### AI Gateway — 15 tests

| Test Class | Tests | Description |
|------------|-------|-------------|
| TestHealth | 1 | Health endpoint returns healthy status |
| TestRAG | 2 | RAG query mock, RAG with course context |
| TestClassAnalysis | 4 | Summarize, extract concepts, generate quiz, analyze |
| TestAssessment | 2 | Grade draft, plagiarism check |
| TestLearner | 3 | Risk prediction, profile update, recommendations |
| TestCorrelationId | 3 | ID generation, preservation, process time header |

### What Tests Verify

1. **Response structure** — All endpoints return expected fields
2. **Status codes** — 200 for successful operations
3. **AI Governance** — `human_review_required` is true for grading/analysis
4. **Confidence scores** — Present and within valid range (0-1)
5. **Correlation ID** — Middleware generates/preserves IDs correctly
6. **Mock mode** — All endpoints work without external API calls

## Test Strategy

### Unit Tests
- Test individual service methods with mocked Prisma client
- Verify tenant isolation in all service queries
- Verify RBAC enforcement

### Integration Tests
- Test API endpoints with real database
- Verify authentication flow
- Verify enrollment → progress → grading flow

### E2E Tests (Critical Flows)
1. Register → Login → Enroll → View Course
2. Create Assessment → Submit → Auto-grade
3. Ask AI Tutor → Verify Response Structure
4. Track Event → View Progress → Check Risk Score

## CI/CD

Tests should run before each deployment:
```powershell
.\scripts\remote.ps1 test
```
