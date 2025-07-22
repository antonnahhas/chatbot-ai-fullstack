from fastapi import APIRouter, HTTPException
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

router = APIRouter()
db = firestore.client(app=get_firebase_app())

@router.post("/chat")
def chat_endpoint(payload: ChatRequest):
    session_id = payload.session_id
    user_input = payload.user_input

    store_message(session_id, "user", user_input)
    history = get_chat_history(session_id)
    assistant_reply = "This endpoint is for testing. Please use /chat/stream for real-time responses."
    store_message(session_id, "assistant", assistant_reply)

    return {"reply": assistant_reply}

@router.get("/chat/stream")
async def chat_stream(session_id: str, user_input: str):
    from services.chat_storage import store_message, get_chat_history
    from services.openai_client import stream_chat_completion

    store_message(session_id, "user", user_input)
    history = get_chat_history(session_id)

    async def event_generator():
        try:
            async for chunk in stream_chat_completion(history):
                yield f"data: {chunk}\n\n"
        except Exception as e:
            import traceback
            traceback.print_exc()  
            yield f"event: error\ndata: {str(e)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# GET all sessions
@router.get("/chats")
def get_all_sessions():
    sessions = list_sessions()
    # Ensure consistent data structure
    return {
        "sessions": [
            {
                "id": session.get("session_id", session.get("id")),
                "title": session.get("title", "Untitled Chat")
            }
            for session in sessions
        ]
    }

# POST to create a new session
@router.post("/chats")
def create_chat():
    session_id = str(uuid4())
    db.collection("chats").document(session_id).set({
        "created_at": firestore.SERVER_TIMESTAMP,
        "title": "New Chat"  # Default title
    })
    return {"session_id": session_id}

# GET messages for a specific session
@router.get("/chats/{session_id}/messages")
def get_session_messages(session_id: str):
    try:
        messages = get_chat_history(session_id)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# DELETE session by ID
@router.delete("/chats/{session_id}")
def delete_chat_session(session_id: str):
    try:
        delete_session(session_id)
        return {"detail": "Session deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))