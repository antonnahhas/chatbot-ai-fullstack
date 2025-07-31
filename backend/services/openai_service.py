# services/openai_service.py
"""
OpenAI service for chat completions.
"""

import openai
from typing import List, Dict, AsyncGenerator
from config.settings import settings
from utils.constants import ERROR_OPENAI_STREAMING
import logging

logger = logging.getLogger(__name__)

# Set OpenAI API key
openai.api_key = settings.openai_api_key


class OpenAIService:
    """
    Service class for OpenAI API interactions.
    """
    
    def __init__(self):
        """Initialize OpenAI service with configuration."""
        self.model = settings.openai_model
        self.temperature = settings.openai_temperature
        self.max_tokens = settings.openai_max_tokens
    
    async def stream_chat_completion(
        self, 
        history: List[Dict[str, str]]
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat completion from OpenAI.
        
        Args:
            history: List of message dictionaries with 'role' and 'content'
            
        Yields:
            String chunks of the assistant's response
            
        Raises:
            Exception: If OpenAI API call fails
        """
        try:
            # Create streaming chat completion
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=history,
                stream=True,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            # Stream response chunks
            async for chunk in response:
                content = chunk.choices[0].delta.get("content", "")
                if content:
                    yield content
                    
        except Exception as e:
            error_msg = f"{ERROR_OPENAI_STREAMING}: {str(e)}"
            logger.error(error_msg)
            yield f"Error: {str(e)}"


# Create singleton instance
openai_service = OpenAIService()