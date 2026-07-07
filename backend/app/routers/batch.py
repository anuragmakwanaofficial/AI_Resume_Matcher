"""
Batch Matcher Router — POST /api/batch, GET /api/batch/{id}
"""
import logging
import uuid
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.analysis import Analysis, SkillMatch
from ..models.batch_analysis import BatchAnalysis
from ..models.user import User
from ..schemas.analysis import AnalysisResponse
from ..services.text_extractor import extract_text_from_file
from ..services.matcher_service import matcher_service
from ..services.email_service import send_batch_completion_email
from ..utils.security import get_current_user_optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/batch", tags=["Batch Matcher"])


@router.post("/")
async def run_batch_match(
    jd_text: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None),
    resume_files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Run a batch resume-JD match analysis.
    Accepts one JD and multiple resumes.
    """
    if not resume_files:
        raise HTTPException(status_code=422, detail="At least one resume file is required.")

    # --- Extract JD text ---
    jd_filename = None
    final_jd_text = jd_text or ""
    if jd_file and jd_file.filename:
        jd_filename = jd_file.filename
        file_bytes = await jd_file.read()
        try:
            final_jd_text = extract_text_from_file(jd_file.filename, file_bytes)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif not final_jd_text.strip():
        raise HTTPException(status_code=422, detail="Please provide job description text or upload a file.")

    # --- Create Batch Record ---
    batch_record = BatchAnalysis(
        jd_filename=jd_filename,
        jd_text=final_jd_text[:3000],
        user_id=current_user.id if current_user else None
    )
    db.add(batch_record)
    db.flush()

    analyses = []
    # --- Process Resumes ---
    for resume_file in resume_files:
        if not resume_file.filename:
            continue
            
        resume_filename = resume_file.filename
        file_bytes = await resume_file.read()
        try:
            resume_text = extract_text_from_file(resume_filename, file_bytes)
        except ValueError as e:
            logger.error(f"Failed to extract {resume_filename}: {e}")
            continue
            
        try:
            result = matcher_service.analyze(resume_text, final_jd_text)
        except Exception as e:
            logger.error(f"Analysis failed for {resume_filename}: {e}")
            continue

        analysis = Analysis(
            resume_filename=resume_filename,
            jd_filename=jd_filename,
            resume_text=resume_text[:5000],
            jd_text=final_jd_text[:3000],
            overall_score=result["overall_score"],
            narrative=result.get("narrative"),
            suggestions=result.get("suggestions", []),
            user_id=current_user.id if current_user else None,
            batch_id=batch_record.id
        )
        db.add(analysis)
        db.flush()
        
        # Save skill matches
        for skill in result.get("matched_skills", {}).get("must_have", []):
            if skill: db.add(SkillMatch(analysis_id=analysis.id, skill_name=str(skill), category="must_have", status="matched"))
        for skill in result.get("matched_skills", {}).get("nice_to_have", []):
            if skill: db.add(SkillMatch(analysis_id=analysis.id, skill_name=str(skill), category="nice_to_have", status="matched"))
        for skill in result.get("missing_skills", {}).get("must_have", []):
            if skill: db.add(SkillMatch(analysis_id=analysis.id, skill_name=str(skill), category="must_have", status="missing"))
        for skill in result.get("missing_skills", {}).get("nice_to_have", []):
            if skill: db.add(SkillMatch(analysis_id=analysis.id, skill_name=str(skill), category="nice_to_have", status="missing"))
            
        analyses.append(analysis)

    db.commit()
    
    if current_user and analyses:
        top_score = max([a.overall_score for a in analyses])
        send_batch_completion_email(
            user_email=current_user.email,
            batch_id=str(batch_record.id),
            candidate_count=len(analyses),
            top_score=top_score
        )
    
    return {
        "batch_id": batch_record.id,
        "processed": len(analyses),
        "total_submitted": len(resume_files)
    }

@router.get("/{batch_id}")
def get_batch_results(batch_id: uuid.UUID, db: Session = Depends(get_db)):
    """Retrieve candidate ranking for a batch."""
    batch = db.query(BatchAnalysis).filter(BatchAnalysis.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found.")
        
    # Get all analyses for this batch, ordered by score descending
    analyses = (
        db.query(Analysis)
        .filter(Analysis.batch_id == batch_id)
        .order_by(Analysis.overall_score.desc())
        .all()
    )
    
    return {
        "batch_id": batch.id,
        "jd_filename": batch.jd_filename,
        "created_at": batch.created_at,
        "candidates": [
            {
                "id": a.id,
                "resume_filename": a.resume_filename,
                "overall_score": a.overall_score,
                "narrative": a.narrative
            }
            for a in analyses
        ]
    }
