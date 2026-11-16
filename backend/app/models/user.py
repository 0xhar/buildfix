from sqlalchemy import Boolean, Column, String, Integer
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    
    # Relationship with integrations
    integrations = relationship("Integration", back_populates="user")
    
    # Relationship with builds (if user has direct access to builds)
    builds = relationship("Build", back_populates="user")
