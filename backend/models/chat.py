# models/chat.py
"""
Pydantic models for chat-related data structures.
"""

from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


class ChatRequest(BaseModel):
    """
    Model for incoming chat requests.
    
    Attributes:
        session_id: Unique identifier for the chat session
        user_input: The user's message content
    """
    session_id: str = Field(..., description="Unique chat session identifier")
    user_input: str = Field(..., description="User's message content")


class ChatMessage(BaseModel):
    """
    Model for a single chat message.
    
    Attributes:
        role: Either 'user' or 'assistant'
        content: The message content
        timestamp: When the message was created
    """
    role: Literal["user", "assistant"]
    content: str
    timestamp: Optional[datetime] = None


class ChatSession(BaseModel):
    """
    Model for a chat session.
    
    Attributes:
        id: Unique session identifier
        title: Display title for the chat
        created_at: When the session was created
    """
    id: str
    title: str = "New Chat"
    created_at: Optional[datetime] = None


class ChatResponse(BaseModel):
    """
    Model for chat API responses.
    
    Attributes:
        session_id: The chat session ID
        reply: The assistant's response (for non-streaming)
    """
    session_id: str
    reply: str