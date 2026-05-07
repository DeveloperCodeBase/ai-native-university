# API Reference

## Base URL

- Development: `http://localhost:4000/api`
- Production: `http://193.163.201.141:3010/api`
- Swagger UI: `/api/docs`

## Authentication

All authenticated endpoints require `Authorization: Bearer <jwt_token>` header.

### POST /auth/login
Login and get JWT tokens.

**Body:**
```json
{
  "tenantSlug": "demo-university",
  "email": "student@demo.university.ir",
  "password": "Demo@1234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "...",
    "user": { "id": "...", "email": "...", "fullName": "...", "role": "student" }
  }
}
```

### POST /auth/register
Register a new user account.

### POST /auth/refresh
Refresh access token using refresh token.

---

## Tenants

### GET /tenants
List all tenants (super_admin only).

### POST /tenants
Create a new tenant (super_admin only).

### GET /tenants/:id
Get tenant by ID.

### PATCH /tenants/:id
Update tenant.

---

## Users

### GET /users
List users for current tenant.

### POST /users
Create a user.

### GET /users/:id
Get user by ID.

---

## Faculties

### GET /faculties
List faculties for current tenant.

### POST /faculties
Create faculty (admin only).

### POST /faculties/:id/departments
Create department under faculty.

### GET /faculties/:id/departments
List departments.

### POST /faculties/departments/:id/programs
Create program under department.

### GET /faculties/departments/:id/programs
List programs.

### GET /faculties/:id
Get faculty by ID.

---

## Courses

### GET /courses/catalog
Public course catalog (no auth required). Supports query params: `search`, `level`, `status`, `tenantId`.

### GET /courses/catalog/:slug
Public course detail by slug (no auth).

### POST /courses
Create course (admin/instructor).

### GET /courses
List courses for current tenant.

### GET /courses/:id
Get course by ID.

### PATCH /courses/:id
Update course.

### POST /courses/:courseId/modules
Create course module.

### GET /courses/:courseId/modules
List course modules.

### POST /courses/:courseId/modules/:moduleId/lessons
Create lesson in module.

### GET /courses/lessons/:lessonId
Get lesson by ID.

### POST /courses/:courseId/instructors/:userId
Assign instructor to course.

---

## Enrollments

### POST /enrollments
Enroll in a course.

**Body:**
```json
{ "courseId": "uuid" }
```

### GET /enrollments
List all enrollments (admin).

### GET /enrollments/my
Get current user's enrollments.

### GET /enrollments/course/:courseId
Get enrollments for a course.

### PATCH /enrollments/:id/status
Update enrollment status.

### PATCH /enrollments/:id/progress
Update enrollment progress.

---

## Class Sessions

### POST /class-sessions
Create class session (admin/instructor).

### GET /class-sessions
List class sessions. Query: `courseId`, `status`.

### GET /class-sessions/:id
Get session detail.

### PATCH /class-sessions/:id
Update session.

### POST /class-sessions/:id/join
Join session (record attendance).

### POST /class-sessions/:id/leave
Leave session.

### POST /class-sessions/:id/recordings
Add recording to session (admin/instructor).

### GET /class-sessions/:id/recordings
List recordings for session.

---

## Assessments

### POST /assessments
Create assessment (admin/instructor).

### GET /assessments/course/:courseId
List assessments for a course.

### GET /assessments/:id
Get assessment detail.

### PATCH /assessments/:id
Update assessment.

### POST /assessments/:id/questions
Add question to assessment.

### GET /assessments/:id/questions
List questions.

### POST /assessments/:id/submit
Submit answers.

### GET /assessments/:id/submissions
List submissions (instructor/admin).

### GET /assessments/:id/submissions/my
Get current user's submission.

### PATCH /assessments/submissions/:submissionId/grade
Grade a submission (instructor/admin).

---

## Analytics

### POST /analytics/events
Track a learning event.

### POST /analytics/events/batch
Track multiple events at once.

### GET /analytics/progress/my
Get current student's progress.

### GET /analytics/progress/student/:userId
Get a student's progress (instructor/admin).

### GET /analytics/course/:courseId
Get course analytics.

### GET /analytics/tenant
Get tenant-wide analytics (admin only).

### GET /analytics/risk/:userId/:courseId
Get risk score for student in course.

---

## AI

### POST /ai/tutor/ask
Ask the AI tutor a question (RAG).

**Body:**
```json
{
  "query": "هوش مصنوعی چیست؟",
  "courseId": "optional-uuid"
}
```

### POST /ai/class-sessions/:sessionId/summarize
Summarize a class session.

### POST /ai/class-sessions/:sessionId/extract-concepts
Extract concepts from a session.

### POST /ai/class-sessions/:sessionId/generate-quiz
Generate quiz from session content.

### POST /ai/class-sessions/:sessionId/analyze
Full analysis (summary + concepts + quiz).

### GET /ai/logs
List AI interaction logs (admin only).

---

## AI Gateway (Direct)

Base URL: `http://193.163.201.141:3010/ai/v1`

### GET /health
Gateway health check.

### POST /rag/query
RAG query (bypasses NestJS).

### POST /class-sessions/:id/summarize
Class summarization.

### POST /assessment/grade-draft
AI grading draft.

### POST /learning-risk/predict
Risk prediction.

---

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Roles

| Role | Level | Description |
|------|-------|-------------|
| super_admin | 1 | Full access, bypasses tenant |
| admin | 2 | Tenant administrator |
| instructor | 3 | Course instructor |
| teaching_assistant | 4 | Assistant |
| student | 5 | Student |
