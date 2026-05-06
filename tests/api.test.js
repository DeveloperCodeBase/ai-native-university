/**
 * API tests for AI Native University.
 * Uses built-in Node.js test runner (Node 20+).
 */
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const body = await res.json();
  return { status: res.status, body };
}

async function post(path, data) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  return { status: res.status, body };
}

describe("Health", () => {
  it("GET /health returns ok", async () => {
    const { status, body } = await get("/health");
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.service, "ai-native-university");
  });
});

describe("Courses API", () => {
  it("GET /api/courses returns course list", async () => {
    const { status, body } = await get("/api/courses");
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.ok(Array.isArray(body.courses));
    assert.ok(body.courses.length >= 3);
  });

  it("GET /api/courses/intro-to-ai returns course detail", async () => {
    const { status, body } = await get("/api/courses/intro-to-ai");
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.course.id, "intro-to-ai");
    assert.ok(Array.isArray(body.course.lessons));
  });

  it("GET /api/courses/nonexistent returns 404", async () => {
    const { status, body } = await get("/api/courses/nonexistent");
    assert.equal(status, 404);
    assert.equal(body.ok, false);
  });

  it("GET /api/courses/intro-to-ai/lessons/what-is-ai returns lesson", async () => {
    const { status, body } = await get("/api/courses/intro-to-ai/lessons/what-is-ai");
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.lesson.id, "what-is-ai");
    assert.ok(body.lesson.content.length > 50);
  });

  it("GET /api/courses/intro-to-ai/lessons/nonexistent returns 404", async () => {
    const { status, body } = await get("/api/courses/intro-to-ai/lessons/nonexistent");
    assert.equal(status, 404);
    assert.equal(body.ok, false);
  });
});

describe("Quiz API", () => {
  it("GET /api/courses/intro-to-ai/lessons/what-is-ai/quiz returns quiz", async () => {
    const { status, body } = await get("/api/courses/intro-to-ai/lessons/what-is-ai/quiz");
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.ok(Array.isArray(body.quiz));
    assert.ok(body.quiz.length > 0);
    // Answers should be stripped from multiple-choice
    const mc = body.quiz.find((q) => q.type === "multiple-choice");
    if (mc) {
      assert.equal(mc.answer, undefined);
    }
  });

  it("POST /api/quiz/evaluate with correct MC answer", async () => {
    const { status, body } = await post("/api/quiz/evaluate", {
      courseId: "intro-to-ai",
      lessonId: "what-is-ai",
      answers: [{ id: "q1", answer: 0 }],
    });
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.ok(body.results.length > 0);
    assert.equal(body.results[0].correct, true);
  });
});

describe("Chat API", () => {
  it("POST /api/chat requires message", async () => {
    const { status, body } = await post("/api/chat", {});
    assert.equal(status, 400);
    assert.equal(body.ok, false);
  });

  it("POST /api/tutor/chat requires message", async () => {
    const { status, body } = await post("/api/tutor/chat", {});
    assert.equal(status, 400);
    assert.equal(body.ok, false);
  });
});
