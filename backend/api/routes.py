from fastapi import APIRouter, HTTPException, status
from firebase_admin import firestore
from fastapi.responses import StreamingResponse
from schemas.chat import ChatRequest
from services.chat_storage import store_message, get_chat_history
from uuid import uuid4
from config.firebase import get_firebase_app
from services.chat_storage import (
    list_sessions,
    delete_session,
)
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
db = firestore.client(app=get_firebase_app())

@router.post("/chat")
def chat_endpoint(payload: ChatRequest):
    """Test endpoint for non-streaming chat"""
    session_id = payload.session_id
    user_input = payload.user_input

    store_message(session_id, "user", user_input)
    history = get_chat_history(session_id)
    assistant_reply = "This endpoint is for testing. Please use /chat/stream for real-time responses."
    store_message(session_id, "assistant", assistant_reply)

    return {"reply": assistant_reply}

@router.get("/chat/stream")
async def chat_stream(session_id: str, user_input: str):
    """Stream chat responses using Server-Sent Events"""
    from services.chat_storage import store_message, get_chat_history
    from services.openai_client import stream_chat_completion
    
    # Validate inputs
    if not session_id or not user_input:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="session_id and user_input are required"
        )
    
    # Log the request
    logger.info(f"Chat stream request - Session: {session_id}, Input length: {len(user_input)}")

    # Store user message
    store_message(session_id, "user", user_input)
    history = get_chat_history(session_id)

    async def event_generator():
        assistant_message = ""
        try:
            async for chunk in stream_chat_completion(history):
                assistant_message += chunk
                yield f"data: {chunk}\n\n"
            
            # Store the complete assistant message after streaming
            store_message(session_id, "assistant", assistant_message)
            logger.info(f"Completed streaming response for session {session_id}")
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            logger.error(f"Error in chat stream for session {session_id}: {str(e)}")
            yield f"event: error\ndata: {str(e)}\n\n"

    return StreamingResponse(
        event_generator(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@router.get("/chats")
def get_all_sessions():
    """Get all chat sessions"""
    try:
        sessions = list_sessions()
        return {
            "sessions": [
                {
                    "id": session.get("session_id", session.get("id")),
                    "title": session.get("title", "Untitled Chat")
                }
                for session in sessions
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching sessions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch chat sessions"
        )

@router.post("/chats")
def create_chat():
    """Create a new chat session"""
    try:
        session_id = str(uuid4())
        db.collection("chats").document(session_id).set({
            "created_at": firestore.SERVER_TIMESTAMP,
            "title": "New Chat"
        })
        logger.info(f"Created new chat session: {session_id}")
        return {"session_id": session_id}
    except Exception as e:
        logger.error(f"Error creating chat: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create chat session"
        )

@router.get("/chats/{session_id}/messages")
def get_session_messages(session_id: str):
    """Get all messages for a specific chat session"""
    try:
        messages = get_chat_history(session_id)
        return {"messages": messages}
    except Exception as e:
        logger.error(f"Error fetching messages for session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch messages"
        )

@router.delete("/chats/{session_id}")
def delete_chat_session(session_id: str):
    """Delete a chat session and all its messages"""
    try:
        delete_session(session_id)
        logger.info(f"Deleted chat session: {session_id}")
        return {"detail": "Session deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete session"
        )

@router.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "chatbot-api"}