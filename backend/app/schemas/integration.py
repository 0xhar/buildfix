from typing import Optional, Dict, Any
from pydantic import BaseModel


# Shared properties
class IntegrationBase(BaseModel):
    name: str
    integration_type: str
    config: Dict[str, Any] = {}


# Properties to receive via API on creation
class IntegrationCreate(IntegrationBase):
    pass


# Properties to receive via API on update
class IntegrationUpdate(IntegrationBase):
    name: Optional[str] = None
    integration_type: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class IntegrationInDBBase(IntegrationBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True


# Additional properties to return via API
class Integration(IntegrationInDBBase):
    pass
