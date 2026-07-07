"""
Database connection and session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# Create database engine
db_url = settings.DATABASE_URL

# Fix postgres:// -> postgresql:// for SQLAlchemy compatibility
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Neon and cloud DBs require SSL - add if not already present
connect_args = {}
if "localhost" not in db_url and "127.0.0.1" not in db_url:
    connect_args = {"sslmode": "require"}

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    echo=settings.DEBUG,
    connect_args=connect_args
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
