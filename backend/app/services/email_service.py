import logging
from typing import Optional

logger = logging.getLogger(__name__)

def send_analysis_completion_email(user_email: str, analysis_id: str, score: int, resume_name: Optional[str]):
    """
    MOCK email service that simulates sending an email to the user when an analysis is completed.
    """
    resume = resume_name or "Pasted Text"
    subject = f"Your Resume Analysis for {resume} is Ready!"
    body = f"""
    Hello!
    
    Your resume analysis for '{resume}' is complete.
    Overall Match Score: {score}%
    
    You can view the full results and download a PDF report here:
    http://localhost:5173/results/{analysis_id}
    
    Best,
    TalentMatch AI Team
    """
    
    logger.info("="*50)
    logger.info(f"MOCK EMAIL SENT TO: {user_email}")
    logger.info(f"SUBJECT: {subject}")
    logger.info(f"BODY:\n{body}")
    logger.info("="*50)

def send_batch_completion_email(user_email: str, batch_id: str, candidate_count: int, top_score: int):
    """
    MOCK email service for batch analysis completion.
    """
    subject = f"Your Batch Resume Analysis is Ready!"
    body = f"""
    Hello!
    
    Your batch analysis of {candidate_count} resumes is complete.
    The top candidate matched at {top_score}%.
    
    You can view the full candidate ranking here:
    http://localhost:5173/batch/{batch_id}
    
    Best,
    TalentMatch AI Team
    """
    
    logger.info("="*50)
    logger.info(f"MOCK BATCH EMAIL SENT TO: {user_email}")
    logger.info(f"SUBJECT: {subject}")
    logger.info(f"BODY:\n{body}")
    logger.info("="*50)
