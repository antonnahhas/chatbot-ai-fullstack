from fastapi import FastAPI
from pydantic import BaseModel

from openai_client import generate_chat_completion
from chat_storage import store_message, get_chat_history


app = FastAPI()
class ChatRequest(BaseModel):
    session_id: str
    user_input: str

@app.post("/chat")
def chat_endpoint(payload: ChatRequest):
    session_id = payload.session_id
    user_input = payload.user_input

    # Store user message
    store_message(session_id, "user", user_input)

    # Fetch full history
    history = get_chat_history(session_id)

    # Call OpenAI API
    assistant_reply = generate_chat_completion(history)

    # Store assistant reply
    store_message(session_id, "assistant", assistant_reply)

    return {"reply": assistant_reply}
