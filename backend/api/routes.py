from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from schemas.chat import ChatRequest
from services.chat_storage import store_message, get_chat_history
from services.openai_client import stream_chat_completion 

router = APIRouter()

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
