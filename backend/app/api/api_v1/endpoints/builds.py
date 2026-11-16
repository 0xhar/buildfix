from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.services.build_analyzer import analyze_build_failure

router = APIRouter()


@router.get("/", response_model=List[schemas.Build])
def read_builds(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve user's builds.
    """
    return crud.build.get_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.post("/", response_model=schemas.Build)
def create_build(
    *,
    db: Session = Depends(deps.get_db),
    build_in: schemas.BuildCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new build record.
    """
    # Verify integration belongs to user
    integration = crud.integration.get(db=db, id=build_in.integration_id)
    if not integration or integration.user_id != current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Invalid integration ID",
        )
    
    build = crud.build.create_with_owner(
        db=db, obj_in=build_in, user_id=current_user.id
    )
    
    # If build status is failure, trigger analysis
    if build.status == "failure" and build.logs:
        analysis_result = analyze_build_failure(build.logs, build.error_message)
        build = crud.build.update(
            db=db, 
            db_obj=build, 
            obj_in={"analysis_result": analysis_result}
        )
    
    return build


@router.get("/{build_id}", response_model=schemas.Build)
def read_build(
    *,
    db: Session = Depends(deps.get_db),
    build_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get build by ID.
    """
    build = crud.build.get(db=db, id=build_id)
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    if build.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return build


@router.put("/{build_id}", response_model=schemas.Build)
def update_build(
    *,
    db: Session = Depends(deps.get_db),
    build_id: int,
    build_in: schemas.BuildUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a build record.
    """
    build = crud.build.get(db=db, id=build_id)
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    if build.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # If we're updating to a failure status and there's new logs, trigger analysis
    if build_in.status == "failure" and build_in.logs and (
        build.status != "failure" or not build.analysis_result
    ):
        build_in_dict = build_in.dict(exclude_unset=True)
        analysis_result = analyze_build_failure(
            build_in_dict.get("logs", build.logs),
            build_in_dict.get("error_message", build.error_message)
        )
        if "analysis_result" not in build_in_dict:
            build_in_dict["analysis_result"] = analysis_result
        
        return crud.build.update(db=db, db_obj=build, obj_in=build_in_dict)
    
    return crud.build.update(db=db, db_obj=build, obj_in=build_in)


@router.get("/integration/{integration_id}", response_model=List[schemas.Build])
def read_builds_by_integration(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get builds for a specific integration.
    """
    integration = crud.integration.get(db=db, id=integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    if integration.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.build.get_by_integration(
        db=db, integration_id=integration_id, skip=skip, limit=limit
    )


@router.get("/status/{status}", response_model=List[schemas.Build])
def read_builds_by_status(
    *,
    db: Session = Depends(deps.get_db),
    status: str,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get builds by status (success, failure, in_progress).
    """
    if status not in ["success", "failure", "in_progress"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    return crud.build.get_by_status(
        db=db, user_id=current_user.id, status=status, skip=skip, limit=limit
    )
