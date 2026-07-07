"""
Admin Router — GET /api/admin/analyses
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models.user import User
from ..models.analysis import Analysis
from ..schemas.analysis import HistoryResponse
from ..schemas.user import UserResponse
from ..utils.security import get_current_user
from typing import List
from uuid import UUID

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user


@router.get("/analyses", response_model=HistoryResponse)
def get_all_analyses(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """Admin endpoint to get all analyses in the system."""
    total = db.query(Analysis).count()
    items = (
        db.query(Analysis)
        .order_by(desc(Analysis.created_at))
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


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    """Admin endpoint to get top-level stats."""
    total_users = db.query(User).count()
    total_analyses = db.query(Analysis).count()
    return {
        "total_users": total_users,
        "total_analyses": total_analyses
    }


@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    """Admin endpoint to get all users."""
    return db.query(User).order_by(desc(User.created_at)).all()


@router.delete("/users/{user_id}")
def delete_user(user_id: UUID, db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    """Admin endpoint to delete a user by ID."""
    if admin_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    
    user_to_delete = db.query(User).filter(User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user_to_delete)
    db.commit()
    return {"status": "success", "message": "User deleted successfully"}
