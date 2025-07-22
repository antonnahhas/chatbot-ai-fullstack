# api/routes/chat.py
"""
Chat-related API routes.
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import Optional
from models.chat import ChatRequest
from services.firebase_service import firebase_service
from services.openai_service import openai_service
from services.auth_service import auth_service
from utils.constants import (
    ERROR_SESSION_REQUIRED,
    LOG_CHAT_REQUEST,
    LOG_CHAT_COMPLETE,
    LOG_CHAT_ERROR
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def chat_endpoint(payload: ChatRequest):
    """
    Test endpoint for non-streaming chat.
    
    Args:
        payload: ChatRequest with session_id and user_input
        
    Returns:
        Dictionary with assistant's reply
        
    Note:
        This is mainly for testing. Production should use /stream endpoint
    """
    firebase_service.store_message(payload.session_id, "user", payload.user_input)
    history = firebase_service.get_chat_history(payload.session_id)
    
    # For test endpoint, just return a simple message
    assistant_reply = "This endpoint is for testing. Please use /chat/stream for real-time responses."
    firebase_service.store_message(payload.session_id, "assistant", assistant_reply)
    
    return {"reply": assistant_reply}


@router.get("/stream")
async def chat_stream(
    session_id: str, 
    user_input: str,
    token: Optional[str] = None
):
    """
    Stream chat responses using Server-Sent Events (SSE).
    
    Args:
        session_id: The chat session ID (query parameter)
        user_input: The user's message (query parameter)
        token: JWT token for authentication (query parameter for SSE)
        
    Returns:
        StreamingResponse with SSE formatted data
    """
    # Verify token if provided (for SSE authentication)
    user_id = None
    if token:
        try:
            payload = auth_service.verify_token(token)
            user_id = payload.get("sub")
        except:
            pass  # Continue without auth for backward compatibility
    # Validate inputs
    if not session_id or not user_input:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=ERROR_SESSION_REQUIRED
        )
    
    # Log request
    logger.info(LOG_CHAT_REQUEST.format(
        session_id=session_id,
        input_length=len(user_input)
    ))
    
    # Store user message
    firebase_service.store_message(session_id, "user", user_input)
    history = firebase_service.get_chat_history(session_id)
    
    async def event_generator():
        """Generate SSE events for streaming response."""
        assistant_message = ""
        
        try:
            # Stream OpenAI response
            async for chunk in openai_service.stream_chat_completion(history):
                assistant_message += chunk
                yield f"data: {chunk}\n\n"
            
            # Store complete message
            firebase_service.store_message(session_id, "assistant", assistant_message)
            logger.info(LOG_CHAT_COMPLETE.format(session_id=session_id))
            
            # Send completion signal
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            logger.error(LOG_CHAT_ERROR.format(
                session_id=session_id,
                error=str(e)
            ))
            yield f"event: error\ndata: {str(e)}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )