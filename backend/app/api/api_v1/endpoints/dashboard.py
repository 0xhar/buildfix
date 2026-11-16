from typing import Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models
from app.api import deps
from app.schemas.build import BuildStats

router = APIRouter()


@router.get("/stats", response_model=BuildStats)
def read_build_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get build statistics for dashboard.
    """
    return crud.build.get_stats(db=db, user_id=current_user.id)


@router.get("/status-summary")
def read_status_summary(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Dict:
    """
    Get summary of build status by day for the past 30 days.
    """
    # This would require a more advanced query
    # Placeholder for implementation
    return {
        "dates": ["2025-05-25", "2025-05-26", "2025-05-27", "2025-05-28", "2025-05-29", "2025-05-30"],
        "success": [5, 7, 4, 6, 8, 5],
        "failure": [2, 1, 3, 1, 0, 2],
    }


@router.get("/integrations-summary")
def read_integrations_summary(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Dict:
    """
    Get summary of build status by integration.
    """
    # Get user's integrations
    integrations = crud.integration.get_by_user(db=db, user_id=current_user.id)
    
    result = {"integrations": [], "success": [], "failure": []}
    
    for integration in integrations:
        result["integrations"].append(integration.name)
        
        # Count successful builds
        successful = db.query(models.Build).filter(
            models.Build.integration_id == integration.id,
            models.Build.status == "success"
        ).count()
        result["success"].append(successful)
        
        # Count failed builds
        failed = db.query(models.Build).filter(
            models.Build.integration_id == integration.id,
            models.Build.status == "failure"
        ).count()
        result["failure"].append(failed)
    
    return result
