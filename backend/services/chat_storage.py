from firebase_admin import firestore
from typing import Literal
from config.firebase import get_firebase_app

db = firestore.client(app=get_firebase_app())

def store_message(session_id: str, role: Literal["user", "assistant"], content: str):
    chat_ref = db.collection("chats").document(session_id).collection("messages")
    chat_ref.add({"role": role, "content": content})

def get_chat_history(session_id: str) -> list[dict]:
    chat_ref = db.collection("chats").document(session_id).collection("messages")
    docs = chat_ref.stream()
    return [{"role": d.get("role"), "content": d.get("content")} for d in (doc.to_dict() for doc in docs)]
