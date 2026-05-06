const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

const DEFAULT_MODEL =
  process.env.OPENROUTER_DEFAULT_MODEL || "openai/gpt-5.3-codex";

async function chatWithOpenRouter(messages, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing on the server .env file.");
  }

  const model = options.model || DEFAULT_MODEL;

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.OPENROUTER_HTTP_REFERER || "http://193.163.201.141:3010",
      "X-Title": process.env.OPENROUTER_X_TITLE || "AI Native University",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1200,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

module.exports = {
  chatWithOpenRouter,
};
