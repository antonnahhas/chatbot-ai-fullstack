# api/routes/sessions.py
"""
Session management API routes.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List, Dict
from services.firebase_service import firebase_service
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
async def get_all_sessions() -> Dict[str, List[Dict[str, str]]]:
    """
    Get all chat sessions.
    
    Returns:
        Dictionary with 'sessions' key containing list of sessions
        
    Raises:
        HTTPException: If fetching sessions fails
        
    Example Response:
        {
            "sessions": [
                {"id": "123", "title": "Hello chat"},
                {"id": "456", "title": "Another chat"}
            ]
        }
    """
    try:
        sessions = firebase_service.list_sessions()
        
        # Format response with consistent structure
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
        logger.error(f"Error fetching sessions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ERROR_FETCH_SESSIONS
        )


@router.post("")
async def create_chat() -> Dict[str, str]:
    """
    Create a new chat session.
    
    Returns:
        Dictionary with the new session_id
        
    Raises:
        HTTPException: If session creation fails
        
    Example Response:
        {"session_id": "123e4567-e89b-12d3-a456-426614174000"}
    """
    try:
        session_id = firebase_service.create_session()
        logger.info(LOG_SESSION_CREATED.format(session_id=session_id))
        
        return {"session_id": session_id}
        
    except Exception as e:
        logger.error(f"Error creating chat: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ERROR_CREATE_CHAT
        )


@router.get("/{session_id}/messages")
async def get_session_messages(session_id: str) -> Dict[str, List[Dict[str, str]]]:
    """
    Get all messages for a specific chat session.
    
    Args:
        session_id: The chat session ID (path parameter)
        
    Returns:
        Dictionary with 'messages' key containing list of messages
        
    Raises:
        HTTPException: If fetching messages fails
        
    Example Response:
        {
            "messages": [
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi there!"}
            ]
        }
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
async def delete_chat_session(session_id: str) -> Dict[str, str]:
    """
    Delete a chat session and all its messages.
    
    Args:
        session_id: The chat session ID to delete (path parameter)
        
    Returns:
        Dictionary with success message
        
    Raises:
        HTTPException: If deletion fails
        
    Example Response:
        {"detail": "Session deleted successfully"}
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