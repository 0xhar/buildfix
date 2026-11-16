from typing import List, Optional

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.integration import Integration
from app.schemas.integration import IntegrationCreate, IntegrationUpdate


class CRUDIntegration(CRUDBase[Integration, IntegrationCreate, IntegrationUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: IntegrationCreate, user_id: int
    ) -> Integration:
        obj_in_data = obj_in.dict()
        db_obj = Integration(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Integration]:
        return (
            db.query(Integration)
            .filter(Integration.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_type(
        self, db: Session, *, user_id: int, integration_type: str
    ) -> Optional[Integration]:
        return (
            db.query(Integration)
            .filter(Integration.user_id == user_id, Integration.integration_type == integration_type)
            .first()
        )


integration = CRUDIntegration(Integration)
