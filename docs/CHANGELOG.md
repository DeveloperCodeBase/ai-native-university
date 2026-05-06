# Changelog

All notable project changes must be documented here.

## [1.1.0] - 2026-05-06

### Added

- Course catalog with 3 AI courses (Introduction to AI, Prompt Engineering, ML Fundamentals)
- 9 in-depth lessons with full markdown educational content
- Course API endpoints: list, detail, lesson content
- Quiz system with multiple-choice and free-text questions
- AI-powered quiz evaluation via OpenRouter
- AI Tutor endpoint with course-context awareness and conversation history
- Full frontend SPA with hash-based routing
- Dashboard with hero section, stats, and featured courses
- Course catalog page with card grid
- Course detail page with lesson list
- Lesson viewer with markdown rendering
- Interactive quiz interface with scoring
- AI Tutor chat interface with course context selector
- Premium dark theme with glassmorphism, gradient accents, and micro-animations
- API tests using Node.js built-in test runner
- Responsive mobile design

### Changed

- Dockerfile now uses `npm ci` for reproducible builds
- Test command runs against live container
- Full-check includes startup delay for reliable health checks
- Updated all documentation

## [1.0.0] - 2026-05-06

### Added

- Remote Windows-to-Ubuntu deployment workflow.
- Docker-based runtime flow.
- OpenRouter-only AI provider rule.
- OpenRouter client and AI health endpoint.
- Documentation baseline.
