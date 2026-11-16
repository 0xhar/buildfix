from sqlalchemy.orm import Session

from app import crud, schemas
from app.core.config import settings
from app.db import base  # noqa: F401


# make sure all SQL Alchemy models are imported (app.db.base) before initializing DB
# otherwise, SQL Alchemy might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-postgresql/issues/28


def init_db(db: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next line
    # Base.metadata.create_all(bind=engine)

    user = crud.user.get_by_email(db, email=settings.FIRST_SUPERUSER)
    if not user:
        user_in = schemas.UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
            full_name="Initial Admin User",
        )
        user = crud.user.create(db, obj_in=user_in)
        # Add sample integrations for demo
        integration_in = schemas.IntegrationCreate(
            name="Sample GitHub",
            integration_type="github",
            config={"api_url": "https://api.github.com", "access_token": "sample_token"}
        )
        crud.integration.create_with_owner(db=db, obj_in=integration_in, user_id=user.id)
