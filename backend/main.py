from fastapi import FastAPI, Request
from pydantic import BaseModel
from datetime import datetime
from uuid import uuid4
import os
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables
load_dotenv()

# Firebase setup
cred_path = os.getenv("FIREBASE_CREDENTIALS")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI()

# Request model
class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    # Use existing session ID or create one
    session_id = req.session_id or str(uuid4())

    # 1. Store user message
    user_doc = {
        "sender": "user",
        "message": req.message,
        "timestamp": datetime.utcnow()
    }
    db.collection("chats").document(session_id).collection("messages").add(user_doc)

    # 2. Generate dummy AI response
    ai_message = f"Echo: {req.message}"
    ai_doc = {
        "sender": "ai",
        "message": ai_message,
        "timestamp": datetime.utcnow()
    }
    db.collection("chats").document(session_id).collection("messages").add(ai_doc)

    return {
        "session_id": session_id,
        "response": ai_message
    }
