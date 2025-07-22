# api/routes/health.py
"""
Health check API routes.
"""

from fastapi import APIRouter
from utils.constants import SUCCESS_HEALTH_CHECK

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        Dictionary with service status
        
    Example Response:
        {"status": "healthy", "service": "chatbot-api"}
        
    Note:
        This endpoint can be used by monitoring services
        to check if the API is running properly.
    """
    return SUCCESS_HEALTH_CHECK