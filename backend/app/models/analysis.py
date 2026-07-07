"""
ORM Models for AI Resume Matcher
"""
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from ..database import Base


class Analysis(Base):
    """Stores each resume-JD matching analysis."""
    __tablename__ = "analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_filename = Column(String(255), nullable=True)
    jd_filename = Column(String(255), nullable=True)
    resume_text = Column(Text, nullable=False)
    jd_text = Column(Text, nullable=False)
    overall_score = Column(Float, nullable=True)
    narrative = Column(Text, nullable=True)
    suggestions = Column(JSON, nullable=True)  # list of suggestion strings
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("batch_analyses.id"), nullable=True)

    # Relationship
    skill_matches = relationship("SkillMatch", back_populates="analysis", cascade="all, delete-orphan")
    user = relationship("User", back_populates="analyses")
    batch = relationship("BatchAnalysis", back_populates="analyses")


class SkillMatch(Base):
    """Stores individual skill match results for an analysis."""
    __tablename__ = "skill_matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("analyses.id"), nullable=False)
    skill_name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)   # "must_have" | "nice_to_have"
    status = Column(String(20), nullable=False)     # "matched" | "missing"

    # Relationship
    analysis = relationship("Analysis", back_populates="skill_matches")
