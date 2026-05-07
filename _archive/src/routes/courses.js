/**
 * Course API routes.
 */
const express = require("express");
const { getAllCourses, getCourseById, getLesson } = require("../data/courses");
const { getQuiz } = require("../data/quizzes");

const router = express.Router();

// GET /api/courses — list all courses
router.get("/", (req, res) => {
  res.json({ ok: true, courses: getAllCourses() });
});

// GET /api/courses/:id — single course with lesson summaries
router.get("/:id", (req, res) => {
  const course = getCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ ok: false, error: "Course not found" });
  }
  res.json({ ok: true, course });
});

// GET /api/courses/:id/lessons/:lessonId — single lesson with full content
router.get("/:id/lessons/:lessonId", (req, res) => {
  const lesson = getLesson(req.params.id, req.params.lessonId);
  if (!lesson) {
    return res.status(404).json({ ok: false, error: "Lesson not found" });
  }
  res.json({ ok: true, lesson });
});

// GET /api/courses/:id/lessons/:lessonId/quiz — quiz for a lesson
router.get("/:id/lessons/:lessonId/quiz", (req, res) => {
  const quiz = getQuiz(req.params.id, req.params.lessonId);
  if (!quiz) {
    return res.status(404).json({ ok: false, error: "Quiz not found" });
  }
  // Strip answers from multiple-choice for client
  const safeQuiz = quiz.map((q) => {
    if (q.type === "multiple-choice") {
      return { id: q.id, type: q.type, question: q.question, options: q.options };
    }
    return { id: q.id, type: q.type, question: q.question };
  });
  res.json({ ok: true, quiz: safeQuiz });
});

module.exports = router;
