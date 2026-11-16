from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.build import Build
from app.schemas.build import BuildCreate, BuildUpdate


class CRUDBuild(CRUDBase[Build, BuildCreate, BuildUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: BuildCreate, user_id: int
    ) -> Build:
        obj_in_data = obj_in.dict()
        db_obj = Build(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Build]:
        return (
            db.query(Build)
            .filter(Build.user_id == user_id)
            .order_by(Build.started_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_integration(
        self, db: Session, *, integration_id: int, skip: int = 0, limit: int = 100
    ) -> List[Build]:
        return (
            db.query(Build)
            .filter(Build.integration_id == integration_id)
            .order_by(Build.started_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_status(
        self, db: Session, *, user_id: int, status: str, skip: int = 0, limit: int = 100
    ) -> List[Build]:
        return (
            db.query(Build)
            .filter(Build.user_id == user_id, Build.status == status)
            .order_by(Build.started_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_stats(self, db: Session, *, user_id: int) -> Dict[str, Any]:
        # Get total builds
        total_builds = db.query(func.count(Build.id)).filter(Build.user_id == user_id).scalar()
        
        # Get successful builds
        successful_builds = (
            db.query(func.count(Build.id))
            .filter(Build.user_id == user_id, Build.status == "success")
            .scalar()
        )
        
        # Get failed builds
        failed_builds = (
            db.query(func.count(Build.id))
            .filter(Build.user_id == user_id, Build.status == "failure")
            .scalar()
        )
        
        # Calculate success rate
        success_rate = (successful_builds / total_builds) * 100 if total_builds > 0 else 0
        
        # Calculate average duration
        avg_duration = (
            db.query(func.avg(Build.duration))
            .filter(Build.user_id == user_id, Build.duration is not None)
            .scalar()
        )
        
        # Get common failures
        common_failures = (
            db.query(Build.error_type, func.count(Build.error_type).label("count"))
            .filter(Build.user_id == user_id, Build.status == "failure")
            .group_by(Build.error_type)
            .order_by(func.count(Build.error_type).desc())
            .limit(5)
            .all()
        )
        
        return {
            "total_builds": total_builds,
            "successful_builds": successful_builds,
            "failed_builds": failed_builds,
            "success_rate": success_rate,
            "average_duration": avg_duration or 0,
            "common_failures": [{"type": f[0], "count": f[1]} for f in common_failures],
        }


build = CRUDBuild(Build)
