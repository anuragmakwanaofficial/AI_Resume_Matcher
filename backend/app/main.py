"""
AI Resume Matcher — FastAPI Main Application
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:\t  %(name)s - %(message)s"
)
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)

from .config import settings
from .database import engine, Base
from .routers import matcher_router, history_router
from .routers.auth import router as auth_router
from .routers.admin import router as admin_router
from .routers.batch import router as batch_router
from . import models  # Import to register all models in Base.metadata

# Auto-create DB tables (gracefully handle connection errors)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logging.warning(f"Could not create DB tables on startup: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered Resume–JD Matching Tool",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(matcher_router)
app.include_router(batch_router)
app.include_router(history_router)
app.include_router(admin_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Serve Frontend statically
frontend_build_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")

if os.path.exists(frontend_build_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_build_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            return {"error": "API route not found"}
        
        file_path = os.path.join(frontend_build_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_build_dir, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "running",
            "docs": "/docs",
            "warning": "Frontend build not found. Run `npm run build` in the frontend directory."
        }

