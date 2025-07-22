# utils/constants.py
"""
Constants used throughout the backend application.
"""

# API Configuration
API_TITLE = "SumerAI Chatbot API"
API_DESCRIPTION = "A ChatGPT-style chatbot API with streaming responses"
API_VERSION = "1.0.0"

# CORS Configuration
ALLOWED_ORIGINS = ["http://localhost:3000"]

# OpenAI Configuration
DEFAULT_MODEL = "gpt-3.5-turbo"
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_TOKENS = 1000

# Chat Configuration
DEFAULT_CHAT_TITLE = "New Chat"
UNTITLED_CHAT = "Untitled Chat"
TITLE_WORD_LIMIT = 4
TITLE_SUFFIX = "..."

# Error Messages
ERROR_SESSION_REQUIRED = "session_id and user_input are required"
ERROR_FETCH_SESSIONS = "Failed to fetch chat sessions"
ERROR_CREATE_CHAT = "Failed to create chat session"
ERROR_FETCH_MESSAGES = "Failed to fetch messages"
ERROR_DELETE_SESSION = "Failed to delete session"
ERROR_OPENAI_STREAMING = "Error in OpenAI streaming"

# Success Messages
SUCCESS_SESSION_DELETED = "Session deleted successfully"
SUCCESS_HEALTH_CHECK = {"status": "healthy", "service": "chatbot-api"}

# Logging Messages
LOG_CHAT_REQUEST = "Chat stream request - Session: {session_id}, Input length: {input_length}"
LOG_CHAT_COMPLETE = "Completed streaming response for session {session_id}"
LOG_CHAT_ERROR = "Error in chat stream for session {session_id}: {error}"
LOG_SESSION_CREATED = "Created new chat session: {session_id}"
LOG_SESSION_DELETED = "Deleted chat session: {session_id}"
LOG_SESSIONS_FOUND = "Found {count} chat sessions"