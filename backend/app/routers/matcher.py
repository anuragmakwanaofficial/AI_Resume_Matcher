"""
Resume Matcher Router — POST /api/match, GET /api/match/{id}
"""
import logging
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.analysis import Analysis, SkillMatch
from ..models.user import User
from ..schemas.analysis import AnalysisResponse
from ..services.text_extractor import extract_text_from_file
from ..services.matcher_service import matcher_service
from ..services.pdf_generator import generate_analysis_pdf
from ..services.email_service import send_analysis_completion_email
from ..utils.security import get_current_user_optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/match", tags=["Matcher"])


@router.post("/", response_model=AnalysisResponse)
async def run_match(
    resume_text: Optional[str] = Form(None),
    jd_text: Optional[str] = Form(None),
    resume_file: Optional[UploadFile] = File(None),
    jd_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Run a resume–JD match analysis.
    Accepts file uploads and/or pasted text for both resume and JD.
    """
    # --- Extract resume text ---
    resume_filename = None
    final_resume_text = resume_text or ""
    if resume_file and resume_file.filename:
        resume_filename = resume_file.filename
        file_bytes = await resume_file.read()
        try:
            final_resume_text = extract_text_from_file(resume_file.filename, file_bytes)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif not final_resume_text.strip():
        raise HTTPException(status_code=422, detail="Please provide resume text or upload a file.")

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

    # --- Run AI Analysis ---
    try:
        result = matcher_service.analyze(final_resume_text, final_jd_text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in matcher service: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")

    # --- Persist to DB ---
    analysis = Analysis(
        resume_filename=resume_filename,
        jd_filename=jd_filename,
        resume_text=final_resume_text[:5000],  # cap storage
        jd_text=final_jd_text[:3000],
        overall_score=result["overall_score"],
        narrative=result.get("narrative"),
        suggestions=result.get("suggestions", []),
        user_id=current_user.id if current_user else None
    )
    db.add(analysis)
    db.flush()  # get the ID

    # Save skill matches
    for skill in result.get("matched_skills", {}).get("must_have", []):
        if skill:
            db.add(SkillMatch(analysis_id=analysis.id, skill_name=str(skill), category="must_have", status="matched"))
    for skill in result.get("matched_skills", {}).get("nice_to_have", []):
        if skill:
            db.add(SkillMatch(analysis_id=analysis.id, skill_name=str(skill), category="nice_to_have", status="matched"))
    for skill in result.get("missing_skills", {}).get("must_have", []):
        if skill:
            db.add(SkillMatch(analysis_id=analysis.id, skill_name=str(skill), category="must_have", status="missing"))
    for skill in result.get("missing_skills", {}).get("nice_to_have", []):
        if skill:
            db.add(SkillMatch(analysis_id=analysis.id, skill_name=str(skill), category="nice_to_have", status="missing"))

    db.commit()
    db.refresh(analysis)

    # Trigger mock email if user is authenticated
    if current_user:
        send_analysis_completion_email(
            user_email=current_user.email,
            analysis_id=str(analysis.id),
            score=analysis.overall_score,
            resume_name=analysis.resume_filename
        )

    logger.info(f"Analysis {analysis.id} saved. Score: {analysis.overall_score}%")
    return analysis


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(analysis_id: uuid.UUID, db: Session = Depends(get_db)):
    """Retrieve a specific analysis by ID."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return analysis

@router.get("/{analysis_id}/export")
def export_analysis_pdf(analysis_id: uuid.UUID, db: Session = Depends(get_db)):
    """Export analysis as PDF."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")
        
    pdf_bytes = generate_analysis_pdf(analysis)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=Analysis_{analysis_id}.pdf"
        }
    )
