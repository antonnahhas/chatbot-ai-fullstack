from fastapi import APIRouter
from schemas.chat import ChatRequest
from services.chat_storage import store_message, get_chat_history
from services.openai_client import generate_chat_completion

router = APIRouter()

@router.post("/chat")
def chat_endpoint(payload: ChatRequest):
    session_id = payload.session_id
    user_input = payload.user_input

    store_message(session_id, "user", user_input)
    history = get_chat_history(session_id)
    assistant_reply = generate_chat_completion(history)
    store_message(session_id, "assistant", assistant_reply)

    return {"reply": assistant_reply}
