from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, users, integrations, builds, dashboard, analysis

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(builds.router, prefix="/builds", tags=["builds"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
