"""
Batch Analysis ORM Model
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from ..database import Base


class BatchAnalysis(Base):
    """Groups multiple analyses under a single job description run."""
    __tablename__ = "batch_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jd_filename = Column(String(255), nullable=True)
    jd_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="batch_analyses")
    analyses = relationship("Analysis", back_populates="batch", cascade="all, delete-orphan")
