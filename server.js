const express = require("express");
const { chatWithOpenRouter } = require("./src/lib/openrouter");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.type("text/plain").send("AI Native University is running on Ubuntu VPS.");
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "ai-native-university",
    environment: process.env.NODE_ENV || "development",
    provider: "openrouter",
    time: new Date().toISOString(),
  });
});

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

app.listen(port, "0.0.0.0", () => {
  console.log(`AI Native University server running on port ${port}`);
});
