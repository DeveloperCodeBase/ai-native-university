const express = require("express");
const path = require("path");
const { chatWithOpenRouter } = require("./src/lib/openrouter");
const courseRoutes = require("./src/routes/courses");
const tutorRoutes = require("./src/routes/tutor");
const quizRoutes = require("./src/routes/quiz");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "ai-native-university",
    environment: process.env.NODE_ENV || "development",
    provider: "openrouter",
    time: new Date().toISOString(),
  });
});

// AI health check
app.get("/api/ai-health", async (req, res) => {
  try {
    const result = await chatWithOpenRouter([
      {
        role: "system",
        content: "You are a health-check assistant. Reply with OK only.",
      },
      {
        role: "user",
        content: "Health check",
      },
    ], { maxTokens: 20, temperature: 0 });

    res.json({
      ok: true,
      provider: "openrouter",
      model: process.env.OPENROUTER_DEFAULT_MODEL,
      message: result.choices?.[0]?.message?.content || null,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      provider: "openrouter",
      error: error.message,
    });
  }
});

// Legacy chat endpoint (kept for backward compatibility)
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ ok: false, error: "message is required" });
    }

    const result = await chatWithOpenRouter([
      {
        role: "system",
        content: "You are an AI assistant for AI Native University.",
      },
      {
        role: "user",
        content: userMessage,
      },
    ]);

    res.json({
      ok: true,
      provider: "openrouter",
      model: process.env.OPENROUTER_DEFAULT_MODEL,
      message: result.choices?.[0]?.message?.content || null,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// API routes
app.use("/api/courses", courseRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/quiz", quizRoutes);

// SPA fallback — serve index.html for non-API routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ ok: false, error: "Endpoint not found" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ ok: false, error: "Internal server error" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`AI Native University server running on port ${port}`);
});
