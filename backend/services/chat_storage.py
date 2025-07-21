from firebase_admin import firestore
from typing import Literal
import uuid
from config.firebase import get_firebase_app

db = firestore.client(app=get_firebase_app())

def store_message(session_id: str, role: Literal["user", "assistant"], content: str):
    chat_ref = db.collection("chats").document(session_id).collection("messages")
    chat_ref.add({"role": role, "content": content})

def get_chat_history(session_id: str) -> list[dict]:
    chat_ref = db.collection("chats").document(session_id).collection("messages")
    docs = chat_ref.stream()
    return [{"role": d.get("role"), "content": d.get("content")} for d in (doc.to_dict() for doc in docs)]

def list_sessions():
    sessions_ref = db.collection("chats")
    docs = sessions_ref.stream()
    return [{"session_id": doc.id} for doc in docs]

def create_session():
    session_id = str(uuid.uuid4())
    db.collection("chats").document(session_id).set({"created_at": firestore.SERVER_TIMESTAMP})
    return session_id

def delete_session(session_id: str):
    session_ref = db.collection("chats").document(session_id)
    # If messages are subcollection:
    messages_ref = session_ref.collection("messages")
    for msg in messages_ref.stream():
        msg.reference.delete()
    session_ref.delete()