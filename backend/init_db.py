import logging
from app.database import engine, Base
from app.models.user import User
from app.models.analysis import Analysis, SkillMatch
from app.models.batch_analysis import BatchAnalysis

# Auto-create DB tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

print("DB Initialized")
