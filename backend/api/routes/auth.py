# api/routes/auth.py
"""
Authentication API routes.
"""

from fastapi import APIRouter, Depends
from services.auth_service import auth_service
from typing import Dict

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/anonymous")
async def create_anonymous_session() -> Dict[str, str]:
    """
    Create an anonymous user session.
    
    Returns:
        Dictionary with user_id and access_token
        
    Example Response:
        {
            "user_id": "anon_123e4567-e89b-12d3-a456-426614174000",
            "access_token": "eyJ...",
            "token_type": "bearer"
        }
    """
    return await auth_service.create_anonymous_user()


@router.get("/me")
async def get_current_user(
    user_id: str = Depends(auth_service.get_current_user)
) -> Dict[str, str]:
    """
    Get the current authenticated user.
    
    Returns:
        Dictionary with user information
        
    Example Response:
        {
            "user_id": "anon_123e4567-e89b-12d3-a456-426614174000",
            "type": "anonymous"
        }
    """
    return {
        "user_id": user_id,
        "type": "anonymous"
    }