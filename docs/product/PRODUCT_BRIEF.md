# AI-Native Online University - Product Brief

We are building an AI-Native Online University Platform, not a simple LMS.

## Core Idea

AI is not an add-on. AI is the learning infrastructure, cognitive support layer, decision-support engine, and adaptive learning coordinator.

## Primary Goals

- Full online university experience
- LMS
- Live classroom
- Recording
- Transcription-ready architecture
- AI Tutor
- Instructor AI Copilot
- RAG-based answers
- Dynamic learner cognitive profile
- Multi-agent education model
- Learning analytics
- Assessment and grading workflows
- Certificates
- Multi-tenant SaaS
- Persian-first RTL UI
- Standards-ready architecture

## Important

The current server has no GPU. Do not implement local heavy ML. Implement all heavy AI as external API adapters with mocks and OpenAPI contracts. The system must be ready to connect to a future GPU server.

MVP must be production-quality, Docker-based, documented, testable, and deployable on Ubuntu.

## AI Provider Rule

All AI model usage must go through OpenRouter only. See AGENT_RUNBOOK.md for details.
