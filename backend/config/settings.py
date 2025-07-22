# config/settings.py
"""
Application settings and configuration.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Simple settings container."""
    
    # API Settings
    api_title = "SumerAI Chatbot API"
    api_description = "A ChatGPT-style chatbot API with streaming responses"
    api_version = "1.0.0"
    
    # OpenAI Settings
    openai_api_key = os.getenv("OPENAI_API_KEY", "")
    openai_model = "gpt-3.5-turbo"
    openai_temperature = 0.7
    openai_max_tokens = 1000
    
    # CORS Settings
    allowed_origins = ["http://localhost:3000"]
    
    # Firebase Settings  
    firebase_key_path = "firebase-key.json"
    
    # Auth Settings
    secret_key = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    
    # Logging
    log_level = "INFO"


# Create settings instance
settings = Settings()