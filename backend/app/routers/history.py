"""
History Router — GET /api/history
"""
import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.analysis import Analysis
from ..models.user import User
from ..schemas.analysis import HistoryResponse, AnalysisListItem
from ..utils.security import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("/", response_model=HistoryResponse)
def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get paginated list of all past analyses for the logged in user."""
    query = db.query(Analysis).filter(Analysis.user_id == current_user.id)
    total = query.count()
    items = (
        query
        .order_by(Analysis.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return HistoryResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )
