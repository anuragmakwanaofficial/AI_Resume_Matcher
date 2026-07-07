"""
AI Resume Matcher Backend Configuration
"""
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache
import json


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "AI Resume Matcher"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ai_resume_matcher"

    # JWT Authentication
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # LLM / AI Settings
    HF_API_KEY: str = ""
    HF_MODEL_ID: str = "mistralai/Mistral-7B-Instruct-v0.3"
    LLM_BACKEND: str = "api"
    LLM_MAX_NEW_TOKENS: int = 800
    LLM_TEMPERATURE: float = 0.3

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


@lru_cache
def get_settings() -> Settings:
    return Settings()
