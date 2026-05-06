/**
 * AI Tutor routes — context-aware chat with OpenRouter.
 */
const express = require("express");
const { chatWithOpenRouter } = require("../lib/openrouter");
const { getCourseContext } = require("../data/courses");

const router = express.Router();

// POST /api/tutor/chat — AI tutor with course context
router.post("/chat", async (req, res) => {
  try {
    const { message, courseId, lessonId, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ ok: false, error: "message is required" });
    }

    // Build system prompt with optional course context
    let systemPrompt =
      "You are an expert AI tutor for AI Native University. " +
      "You help students understand concepts clearly and patiently. " +
      "Use examples, analogies, and step-by-step explanations. " +
      "Be encouraging and supportive. Keep responses focused and educational.";

    if (courseId) {
      const context = getCourseContext(courseId, lessonId);
      if (context) {
        systemPrompt +=
          "\n\nYou are currently helping the student with the following course material:\n\n" +
          context;
      }
    }

    // Build messages array
    const messages = [{ role: "system", content: systemPrompt }];

    // Include conversation history if provided
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10); // Last 10 messages max
      for (const msg of recentHistory) {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: "user", content: message });

    const result = await chatWithOpenRouter(messages, {
      temperature: 0.3,
      maxTokens: 1500,
    });

    res.json({
      ok: true,
      message: result.choices?.[0]?.message?.content || null,
      model: process.env.OPENROUTER_DEFAULT_MODEL,
    });
  } catch (error) {
    console.error("Tutor chat error:", error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
