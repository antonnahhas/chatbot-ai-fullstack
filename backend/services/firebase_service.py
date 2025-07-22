# services/firebase_service.py
"""
Firebase service for database operations.
"""

from typing import List, Dict, Optional, Literal
import uuid
from firebase_admin import firestore
from config.firebase import get_firebase_app
from utils.constants import (
    DEFAULT_CHAT_TITLE, 
    UNTITLED_CHAT,
    TITLE_WORD_LIMIT,
    TITLE_SUFFIX,
    LOG_SESSIONS_FOUND
)
import logging

logger = logging.getLogger(__name__)


class FirebaseService:
    """
    Service class for Firebase Firestore operations.
    """
    
    def __init__(self):
        """Initialize Firebase service with Firestore client."""
        self.db = firestore.client(app=get_firebase_app())
    
    def store_message(
        self, 
        session_id: str, 
        role: Literal["user", "assistant"], 
        content: str
    ) -> None:
        """
        Store a message in the chat session.
        
        Args:
            session_id: The chat session ID
            role: Either 'user' or 'assistant'
            content: The message content
            
        Side Effects:
            - Updates chat title if it's the first user message
        """
        chat_ref = self.db.collection("chats").document(session_id)
        messages_ref = chat_ref.collection("messages")
        
        # Add message with timestamp
        messages_ref.add({
            "role": role,
            "content": content,
            "timestamp": firestore.SERVER_TIMESTAMP
        })
        
        # Update title on first user message
        if role == "user":
            self._update_chat_title_if_needed(chat_ref, content)
    
    def _update_chat_title_if_needed(
        self, 
        chat_ref: firestore.DocumentReference, 
        content: str
    ) -> None:
        """
        Update chat title based on first user message if still default.
        
        Args:
            chat_ref: Reference to the chat document
            content: The user's message content
        """
        chat_doc = chat_ref.get()
        if chat_doc.exists:
            chat_data = chat_doc.to_dict()
            if chat_data.get("title") in [DEFAULT_CHAT_TITLE, None]:
                # Take first N words as title
                words = content.strip().split()[:TITLE_WORD_LIMIT]
                title = " ".join(words)
                
                # Add ellipsis if message is longer
                if len(words) == TITLE_WORD_LIMIT and len(content.strip().split()) > TITLE_WORD_LIMIT:
                    title += TITLE_SUFFIX
                    
                chat_ref.update({"title": title})
    
    def get_chat_history(self, session_id: str) -> List[Dict[str, str]]:
        """
        Retrieve all messages for a chat session.
        
        Args:
            session_id: The chat session ID
            
        Returns:
            List of message dictionaries with 'role' and 'content'
        """
        chat_ref = self.db.collection("chats").document(session_id).collection("messages")
        docs = chat_ref.order_by("timestamp").stream()
        
        return [
            {
                "role": doc.to_dict().get("role"),
                "content": doc.to_dict().get("content")
            }
            for doc in docs
        ]
    
    def list_sessions(self) -> List[Dict[str, str]]:
        """
        List all chat sessions.
        
        Returns:
            List of session dictionaries with 'session_id' and 'title'
            
        Note:
            Falls back to unordered listing if ordering by created_at fails
        """
        sessions_ref = self.db.collection("chats")
        sessions = []
        
        try:
            # Try ordered query first
            docs = sessions_ref.order_by(
                "created_at", 
                direction=firestore.Query.DESCENDING
            ).stream()
            
            for doc in docs:
                data = doc.to_dict()
                sessions.append({
                    "session_id": doc.id,
                    "title": data.get("title", UNTITLED_CHAT)
                })
                
        except Exception as e:
            # Fallback to unordered if some docs missing created_at
            logger.warning(f"Could not order by created_at: {e}")
            docs = sessions_ref.stream()
            
            for doc in docs:
                data = doc.to_dict()
                sessions.append({
                    "session_id": doc.id,
                    "title": data.get("title", UNTITLED_CHAT)
                })
        
        logger.info(LOG_SESSIONS_FOUND.format(count=len(sessions)))
        return sessions
    
    def create_session(self, session_id: Optional[str] = None) -> str:
        """
        Create a new chat session.
        
        Args:
            session_id: Optional session ID, generates UUID if not provided
            
        Returns:
            The session ID
        """
        if not session_id:
            session_id = str(uuid.uuid4())
            
        self.db.collection("chats").document(session_id).set({
            "created_at": firestore.SERVER_TIMESTAMP,
            "title": DEFAULT_CHAT_TITLE
        })
        
        return session_id
    
    def delete_session(self, session_id: str) -> None:
        """
        Delete a chat session and all its messages.
        
        Args:
            session_id: The chat session ID to delete
            
        Note:
            Uses batch operations for efficient deletion
        """
        session_ref = self.db.collection("chats").document(session_id)
        messages_ref = session_ref.collection("messages")
        
        # Batch delete all messages
        batch = self.db.batch()
        for msg in messages_ref.stream():
            batch.delete(msg.reference)
        batch.commit()
        
        # Delete the chat document
        session_ref.delete()


# Create singleton instance
firebase_service = FirebaseService()