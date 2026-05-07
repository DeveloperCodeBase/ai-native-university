"""AI Gateway configuration from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ai_mode: str = "mock"  # mock or external_api
    ai_services_base_url: str = "https://future-gpu-server.example.com"
    ai_services_api_key: str = "change-me"
    ai_timeout_seconds: int = 120

    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_default_model: str = "openai/gpt-4o-mini"

    ai_gateway_api_key: str = "change-me-gateway-key"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
