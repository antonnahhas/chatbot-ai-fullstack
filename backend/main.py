from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid

app = FastAPI()

# Temporary in-memory store (we'll switch to Firestore later)
fake_db = {}

class ChatRequest(BaseModel):
    session_id: Optional[str]
    message: str

class ChatResponse(BaseModel):
    session_id: str
    response: str

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())
    
    # Mock response for now (later replaced by OpenAI)
    ai_reply = f"Echo: {request.message}"

    # Save to fake_db (simulate Firestore)
    if session_id not in fake_db:
        fake_db[session_id] = []
    
    fake_db[session_id].append({
        "sender": "user",
        "text": request.message
    })
    fake_db[session_id].append({
        "sender": "ai",
        "text": ai_reply
    })

    return ChatResponse(session_id=session_id, response=ai_reply)
