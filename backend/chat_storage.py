import os
from typing import Literal
from firebase_admin import firestore, initialize_app, get_app, credentials

# Initialize Firebase app if not already initialized
try:
    get_app()
except ValueError:
    cred_path = os.path.join(os.getcwd(), "firebase-key.json")  
    cred = credentials.Certificate(cred_path)
    initialize_app(cred)

def store_message(session_id: str, role: Literal["user", "assistant"], content: str):
    db = firestore.client()
    chat_ref = db.collection("chats").document(session_id).collection("messages")
    chat_ref.add({
        "role": role,
        "content": content
    })

def get_chat_history(session_id: str) -> list[dict]:
    db = firestore.client()
    chat_ref = db.collection("chats").document(session_id).collection("messages")
    docs = chat_ref.stream()
    history = []
    for doc in docs:
        data = doc.to_dict()
        if "role" in data and "content" in data:
            history.append({
                "role": data["role"],
                "content": data["content"]
            })
    return history
