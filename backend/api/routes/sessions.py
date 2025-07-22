# api/routes/sessions.py
"""
Session management API routes with optional authentication.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Optional
from services.firebase_service import firebase_service
from services.auth_service import auth_service
from utils.constants import (
    ERROR_FETCH_SESSIONS,
    ERROR_CREATE_CHAT,
    ERROR_FETCH_MESSAGES,
    ERROR_DELETE_SESSION,
    SUCCESS_SESSION_DELETED,
    LOG_SESSION_CREATED,
    LOG_SESSION_DELETED
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chats", tags=["sessions"])


@router.get("")
async def get_all_sessions(
    user_id: str = Depends(auth_service.get_current_user)
) -> Dict[str, List[Dict[str, str]]]:
    """
    Get all chat sessions for the authenticated user.
    """
    try:
        # Get sessions for authenticated user only
        sessions = firebase_service.list_user_sessions(user_id)
        
        return {
            "sessions": [
                {
                    "id": session.get("session_id"),
                    "title": session.get("title", "Untitled Chat")
                }
                for session in sessions
            ]
        }
        
    except Exception as e:
        logger.error(f"Error fetching sessions for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ERROR_FETCH_SESSIONS
        )


@router.post("")
async def create_chat(
    user_id: str = Depends(auth_service.get_current_user)
) -> Dict[str, str]:
    """
    Create a new chat session for the authenticated user.
    """
    try:
        session_id = firebase_service.create_session(user_id=user_id)
        logger.info(f"Created chat {session_id} for user {user_id}")
        
        return {"session_id": session_id}
        
    except Exception as e:
        logger.error(f"Error creating chat for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ERROR_CREATE_CHAT
        )


@router.get("/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    user_id: Optional[str] = Depends(auth_service.get_current_user_optional)
) -> Dict[str, List[Dict[str, str]]]:
    """
    Get all messages for a specific chat session.
    """
    try:
        messages = firebase_service.get_chat_history(session_id)
        return {"messages": messages}
        
    except Exception as e:
        logger.error(f"Error fetching messages for session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ERROR_FETCH_MESSAGES
        )


@router.delete("/{session_id}")
async def delete_chat_session(
    session_id: str,
    user_id: Optional[str] = Depends(auth_service.get_current_user_optional)
) -> Dict[str, str]:
    """
    Delete a chat session and all its messages.
    """
    try:
        firebase_service.delete_session(session_id)
        logger.info(LOG_SESSION_DELETED.format(session_id=session_id))
        
        return {"detail": SUCCESS_SESSION_DELETED}
        
    except Exception as e:
        logger.error(f"Error deleting session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ERROR_DELETE_SESSION
        )