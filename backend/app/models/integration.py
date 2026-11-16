from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Integration(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    integration_type = Column(String, index=True)  # e.g., 'github', 'jenkins', 'gitlab', 'circle-ci'
    config = Column(JSON)  # Store credentials and configuration
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey("user.id"))
    user = relationship("User", back_populates="integrations")
    
    # Relationship with builds
    builds = relationship("Build", back_populates="integration")
