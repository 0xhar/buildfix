from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.services.build_analyzer import analyze_build_failure, get_similar_failures

router = APIRouter()


@router.get("/{build_id}", response_model=schemas.BuildAnalysis)
def read_build_analysis(
    *,
    db: Session = Depends(deps.get_db),
    build_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get detailed analysis for a build failure.
    """
    build = crud.build.get(db=db, id=build_id)
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    if build.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if build.status != "failure":
        raise HTTPException(status_code=400, detail="Build is not a failure")
    
    # If build doesn't have analysis result yet, generate it
    if not build.analysis_result:
        analysis_result = analyze_build_failure(build.logs, build.error_message)
        build = crud.build.update(
            db=db, 
            db_obj=build, 
            obj_in={"analysis_result": analysis_result}
        )
    
    # Get similar failures
    similar_failures = get_similar_failures(db, build)
    
    return {
        "build_id": build.build_id,
        "error_type": build.error_type,
        "error_message": build.error_message,
        "suggested_fix": build.analysis_result.get("suggested_fix", "No fix suggestion available"),
        "confidence_score": build.analysis_result.get("confidence_score", 0.0),
        "similar_failures": similar_failures
    }


@router.get("/error-types/summary", response_model=List[dict])
def read_error_types_summary(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get summary of error types across all builds.
    """
    # This would be implemented with a grouped query
    # Placeholder implementation
    return [
        {"error_type": "Dependency resolution", "count": 12, "percentage": 35},
        {"error_type": "Compilation error", "count": 10, "percentage": 29},
        {"error_type": "Test failure", "count": 8, "percentage": 24},
        {"error_type": "Missing credentials", "count": 4, "percentage": 12},
    ]
