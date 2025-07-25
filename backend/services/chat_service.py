from firebase_admin import firestore
from typing import Literal
import uuid
from config.firebase import get_firebase_app

db = firestore.client(app=get_firebase_app())

def store_message(session_id: str, role: Literal["user", "assistant"], content: str):
    chat_ref = db.collection("chats").document(session_id)
    messages_ref = chat_ref.collection("messages")
    
    # Add timestamp to messages
    messages_ref.add({
        "role": role, 
        "content": content,
        "timestamp": firestore.SERVER_TIMESTAMP
    })

    # Update chat title based on first user message
    if role == "user":
        chat_doc = chat_ref.get()
        if chat_doc.exists:
            chat_data = chat_doc.to_dict()
            # Only update title if it's still the default
            if chat_data.get("title") in ["New Chat", None]:
                # Take first 4 words of the message
                words = content.strip().split()[:4]
                title = " ".join(words)
                if len(words) == 4 and len(content.strip().split()) > 4:
                    title += "..."
                chat_ref.update({"title": title})

def get_chat_history(session_id: str) -> list[dict]:
    chat_ref = db.collection("chats").document(session_id).collection("messages")
    # Order by timestamp to ensure correct message order
    docs = chat_ref.order_by("timestamp").stream()
    return [
        {
            "role": doc.to_dict().get("role"), 
            "content": doc.to_dict().get("content")
        } 
        for doc in docs
    ]

def list_sessions():
    sessions_ref = db.collection("chats")
    sessions = []
    
    try:
        # First try to get ordered results
        docs = sessions_ref.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        for doc in docs:
            data = doc.to_dict()
            sessions.append({
                "session_id": doc.id,
                "title": data.get("title", "Untitled Chat")
            })
    except Exception as e:
        # If ordering fails (e.g., some docs missing created_at), get all docs
        print(f"Warning: Could not order by created_at: {e}")
        docs = sessions_ref.stream()
        for doc in docs:
            data = doc.to_dict()
            sessions.append({
                "session_id": doc.id,
                "title": data.get("title", "Untitled Chat")
            })
    
    print(f"Found {len(sessions)} chat sessions")  # Debug log
    return sessions

def create_session():
    session_id = str(uuid.uuid4())
    db.collection("chats").document(session_id).set({
        "created_at": firestore.SERVER_TIMESTAMP,
        "title": "New Chat"
    })
    return session_id

def delete_session(session_id: str):
    session_ref = db.collection("chats").document(session_id)
    # Delete all messages in the subcollection
    messages_ref = session_ref.collection("messages")
    batch = db.batch()
    for msg in messages_ref.stream():
        batch.delete(msg.reference)
    batch.commit()
    # Delete the chat document itself
    session_ref.delete()