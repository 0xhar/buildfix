import os
from typing import Optional, List
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, validator

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "BuildFix"
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database settings
    SQLALCHEMY_DATABASE_URI: Optional[str] = "sqlite:///./buildfix.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Admin user
    FIRST_SUPERUSER: str = "admin@buildfix.com"
    FIRST_SUPERUSER_PASSWORD: str = "adminpassword"  # Change in production
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
