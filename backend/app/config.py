"""
AI Resume Matcher Backend Configuration
"""
import os
from pydantic_settings import BaseSettings
from pydantic import Field, AliasChoices
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "AI Resume Matcher"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database - reads DATABASE_URL from environment
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/ai_resume_matcher",
        validation_alias=AliasChoices("DATABASE_URL")
    )

    # JWT Authentication - reads JWT_SECRET or SECRET_KEY from environment
    SECRET_KEY: str = Field(
        default="your-super-secret-key-change-in-production",
        validation_alias=AliasChoices("JWT_SECRET", "SECRET_KEY")
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS - allow all origins for Vercel deployment
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "*"]

    # LLM / AI Settings - reads HUGGINGFACE_API_KEY or HF_API_KEY from environment
    HF_API_KEY: str = Field(
        default="",
        validation_alias=AliasChoices("HUGGINGFACE_API_KEY", "HF_API_KEY")
    )
    HF_MODEL_ID: str = "mistralai/Mistral-7B-Instruct-v0.3"
    LLM_BACKEND: str = "api"
    LLM_MAX_NEW_TOKENS: int = 800
    LLM_TEMPERATURE: float = 0.3

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        populate_by_name = True


settings = Settings()


@lru_cache
def get_settings() -> Settings:
    return Settings()
