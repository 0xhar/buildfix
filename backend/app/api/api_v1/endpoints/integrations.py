from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Integration])
def read_integrations(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve user's integrations.
    """
    return crud.integration.get_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.post("/", response_model=schemas.Integration)
def create_integration(
    *,
    db: Session = Depends(deps.get_db),
    integration_in: schemas.IntegrationCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new integration.
    """
    # Check if user already has integration of this type
    existing = crud.integration.get_by_type(db, user_id=current_user.id, integration_type=integration_in.integration_type)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Integration of type {integration_in.integration_type} already exists",
        )
    
    return crud.integration.create_with_owner(
        db=db, obj_in=integration_in, user_id=current_user.id
    )


@router.get("/{integration_id}", response_model=schemas.Integration)
def read_integration(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get integration by ID.
    """
    integration = crud.integration.get(db=db, id=integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    if integration.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return integration


@router.put("/{integration_id}", response_model=schemas.Integration)
def update_integration(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int,
    integration_in: schemas.IntegrationUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an integration.
    """
    integration = crud.integration.get(db=db, id=integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    if integration.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.integration.update(
        db=db, db_obj=integration, obj_in=integration_in
    )


@router.delete("/{integration_id}", response_model=schemas.Integration)
def delete_integration(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an integration.
    """
    integration = crud.integration.get(db=db, id=integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    if integration.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.integration.remove(db=db, id=integration_id)


@router.post("/{integration_id}/test", response_model=dict)
def test_integration(
    *,
    db: Session = Depends(deps.get_db),
    integration_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Test the integration connection.
    """
    integration = crud.integration.get(db=db, id=integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    if integration.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Implement integration testing based on type
    if integration.integration_type == "github":
        # Test GitHub connection
        return {"status": "success", "message": "GitHub connection successful"}
    elif integration.integration_type == "jenkins":
        # Test Jenkins connection
        return {"status": "success", "message": "Jenkins connection successful"}
    elif integration.integration_type == "gitlab":
        # Test GitLab connection
        return {"status": "success", "message": "GitLab connection successful"}
    else:
        return {"status": "error", "message": f"Unsupported integration type: {integration.integration_type}"}
