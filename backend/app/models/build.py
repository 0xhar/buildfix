from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class Build(Base):
    id = Column(Integer, primary_key=True, index=True)
    build_id = Column(String, index=True)  # External build ID from CI/CD system
    repository = Column(String, index=True)
    branch = Column(String, index=True)
    commit_hash = Column(String, index=True)
    status = Column(String, index=True)  # success, failure, in_progress
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    duration = Column(Integer)  # Duration in seconds
    
    # Failure details
    error_message = Column(Text)
    error_type = Column(String, index=True)  # categorized error type
    logs = Column(Text)  # Build logs (can be truncated or summarized)
    analysis_result = Column(JSON)  # Detailed analysis of failure
    
    # Foreign keys
    integration_id = Column(Integer, ForeignKey("integration.id"))
    integration = relationship("Integration", back_populates="builds")
    
    user_id = Column(Integer, ForeignKey("user.id"))
    user = relationship("User", back_populates="builds")
