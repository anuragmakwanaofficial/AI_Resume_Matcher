"""
Pydantic schemas for AI Resume Matcher API
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid


class SkillMatchSchema(BaseModel):
    id: uuid.UUID
    skill_name: str
    category: str   # "must_have" | "nice_to_have"
    status: str     # "matched" | "missing"

    class Config:
        from_attributes = True


class AnalysisCreate(BaseModel):
    resume_text: Optional[str] = None
    jd_text: Optional[str] = None
    resume_filename: Optional[str] = None
    jd_filename: Optional[str] = None


class AnalysisResponse(BaseModel):
    id: uuid.UUID
    resume_filename: Optional[str]
    jd_filename: Optional[str]
    overall_score: Optional[float]
    narrative: Optional[str]
    suggestions: Optional[List[str]]
    skill_matches: List[SkillMatchSchema]
    created_at: datetime

    class Config:
        from_attributes = True


class AnalysisListItem(BaseModel):
    id: uuid.UUID
    resume_filename: Optional[str]
    jd_filename: Optional[str]
    overall_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    items: List[AnalysisListItem]
    total: int
    page: int
    page_size: int
