from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime


# Shared properties
class BuildBase(BaseModel):
    build_id: str
    repository: str
    branch: str
    commit_hash: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration: Optional[int] = None
    error_message: Optional[str] = None
    error_type: Optional[str] = None
    logs: Optional[str] = None
    analysis_result: Optional[Dict[str, Any]] = None


# Properties to receive via API on creation
class BuildCreate(BuildBase):
    integration_id: int


# Properties to receive via API on update
class BuildUpdate(BaseModel):
    status: Optional[str] = None
    completed_at: Optional[datetime] = None
    duration: Optional[int] = None
    error_message: Optional[str] = None
    error_type: Optional[str] = None
    logs: Optional[str] = None
    analysis_result: Optional[Dict[str, Any]] = None


class BuildInDBBase(BuildBase):
    id: int
    integration_id: int
    user_id: int

    class Config:
        orm_mode = True


# Additional properties to return via API
class Build(BuildInDBBase):
    pass


# For dashboard aggregation
class BuildStats(BaseModel):
    total_builds: int
    successful_builds: int
    failed_builds: int
    success_rate: float
    average_duration: float
    common_failures: List[Dict[str, Any]]


# For analysis endpoint
class BuildAnalysis(BaseModel):
    build_id: str
    error_type: str
    error_message: str
    suggested_fix: str
    confidence_score: float
    similar_failures: List[Dict[str, Any]]
