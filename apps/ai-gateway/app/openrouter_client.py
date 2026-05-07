"""
OpenRouter client for AI Gateway.
All AI model calls go through OpenRouter only (per AGENT_RUNBOOK.md).
Model names and API keys are read from environment variables — never hardcoded.
"""

import httpx
import time
from typing import Optional
from app.config import settings


class OpenRouterClient:
    """Client for OpenRouter API. Used when AI_MODE=external_api."""

    def __init__(self):
        self.base_url = settings.openrouter_base_url
        self.api_key = settings.openrouter_api_key
        self.default_model = settings.openrouter_default_model
        self.timeout = settings.ai_timeout_seconds

    async def chat_completion(
        self,
        messages: list[dict],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        system_prompt: Optional[str] = None,
    ) -> dict:
        """
        Call OpenRouter chat completions API.
        Returns dict with: answer, model, provider, confidence, latency_ms
        """
        resolved_model = model or self.default_model

        if system_prompt:
            messages = [{"role": "system", "content": system_prompt}] + messages

        start_time = time.time()

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://ai-native-university.example.com",
                    "X-Title": "AI-Native University",
                },
                json={
                    "model": resolved_model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            response.raise_for_status()
            data = response.json()

        latency_ms = (time.time() - start_time) * 1000

        # Extract answer from OpenRouter response
        answer = ""
        if data.get("choices") and len(data["choices"]) > 0:
            answer = data["choices"][0].get("message", {}).get("content", "")

        # Extract model/provider info
        actual_model = data.get("model", resolved_model)
        usage = data.get("usage", {})

        return {
            "answer": answer,
            "model": actual_model,
            "provider": "openrouter",
            "confidence": 0.85,  # OpenRouter doesn't provide confidence; default reasonable value
            "latency_ms": round(latency_ms),
            "usage": {
                "prompt_tokens": usage.get("prompt_tokens", 0),
                "completion_tokens": usage.get("completion_tokens", 0),
                "total_tokens": usage.get("total_tokens", 0),
            },
        }


# Singleton instance
openrouter_client = OpenRouterClient()
