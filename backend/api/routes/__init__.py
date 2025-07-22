# api/routes/__init__.py
"""
API routes aggregator.
"""

from fastapi import APIRouter
from .chat import router as chat_router
from .sessions import router as sessions_router
from .health import router as health_router
from .auth import router as auth_router

# Create main router
api_router = APIRouter()

# Include all sub-routers
api_router.include_router(auth_router)
api_router.include_router(chat_router)
api_router.include_router(sessions_router)
api_router.include_router(health_router)