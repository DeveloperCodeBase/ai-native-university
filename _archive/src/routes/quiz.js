/**
 * Quiz evaluation routes — AI-graded answers via OpenRouter.
 */
const express = require("express");
const { chatWithOpenRouter } = require("../lib/openrouter");
const { getQuiz } = require("../data/quizzes");

const router = express.Router();

// POST /api/quiz/evaluate — evaluate student answers
router.post("/evaluate", async (req, res) => {
  try {
    const { courseId, lessonId, answers } = req.body;

    if (!courseId || !lessonId || !Array.isArray(answers)) {
      return res.status(400).json({
        ok: false,
        error: "courseId, lessonId, and answers[] are required",
      });
    }

    const quiz = getQuiz(courseId, lessonId);
    if (!quiz) {
      return res.status(404).json({ ok: false, error: "Quiz not found" });
    }

    const results = [];

    for (const submission of answers) {
      const question = quiz.find((q) => q.id === submission.id);
      if (!question) continue;

      if (question.type === "multiple-choice") {
        const correct = submission.answer === question.answer;
        results.push({
          id: question.id,
          correct,
          correctAnswer: question.options[question.answer],
        });
      } else if (question.type === "free-text") {
        // Use AI to evaluate free-text answers
        try {
          const evalResult = await chatWithOpenRouter(
            [
              {
                role: "system",
                content:
                  "You are a grading assistant. Evaluate the student's answer against the reference answer. " +
                  "Reply with JSON only: {\"correct\": true/false, \"score\": 0-100, \"feedback\": \"brief feedback\"}",
              },
              {
                role: "user",
                content: `Question: ${question.question}\nReference answer: ${question.answer}\nStudent answer: ${submission.answer}`,
              },
            ],
            { temperature: 0, maxTokens: 200 }
          );

          const content = evalResult.choices?.[0]?.message?.content || "";
          let parsed;
          try {
            // Extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { correct: false, score: 0, feedback: "Could not evaluate." };
          } catch {
            parsed = { correct: false, score: 0, feedback: content };
          }

          results.push({ id: question.id, ...parsed });
        } catch (err) {
          results.push({
            id: question.id,
            correct: false,
            score: 0,
            feedback: "AI evaluation unavailable: " + err.message,
          });
        }
      }
    }

    const totalCorrect = results.filter((r) => r.correct).length;
    const totalQuestions = results.length;

    res.json({
      ok: true,
      score: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      totalCorrect,
      totalQuestions,
      results,
    });
  } catch (error) {
    console.error("Quiz evaluate error:", error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
