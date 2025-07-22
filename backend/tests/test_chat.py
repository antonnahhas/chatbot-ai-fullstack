# tests/test_chat.py
"""
Tests for chat-related endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
from main import app
from models.chat import ChatRequest

client = TestClient(app)


class TestChatEndpoints:
    """Test suite for chat endpoints."""
    
    @patch('services.firebase_service.firebase_service.store_message')
    @patch('services.firebase_service.firebase_service.get_chat_history')
    def test_chat_endpoint(self, mock_get_history, mock_store_message):
        """Test the non-streaming chat endpoint."""
        # Setup mocks
        mock_get_history.return_value = [
            {"role": "user", "content": "Hello"}
        ]
        
        # Make request
        response = client.post(
            "/chat",
            json={"session_id": "test-123", "user_input": "Hello"}
        )
        
        # Assertions
        assert response.status_code == 200
        assert "reply" in response.json()
        assert mock_store_message.called
        assert mock_get_history.called
    
    def test_chat_stream_missing_params(self):
        """Test chat stream with missing parameters."""
        response = client.get("/chat/stream")
        assert response.status_code == 422  # FastAPI returns 422 for validation errors
        
        response = client.get("/chat/stream?session_id=123")
        assert response.status_code == 422
        
        response = client.get("/chat/stream?user_input=Hello")
        assert response.status_code == 422
    
    @patch('services.firebase_service.firebase_service.store_message')
    @patch('services.firebase_service.firebase_service.get_chat_history')
    @patch('services.openai_service.openai_service.stream_chat_completion')
    def test_chat_stream_success(
        self, 
        mock_stream_completion, 
        mock_get_history, 
        mock_store_message
    ):
        """Test successful chat streaming."""
        # Setup mocks
        mock_get_history.return_value = [
            {"role": "user", "content": "Hello"}
        ]
        
        # Create a proper async generator mock
        async def mock_generator():
            yield "Hello"
            yield " there!"
        
        mock_stream_completion.return_value = mock_generator()
        
        # Make request
        response = client.get(
            "/chat/stream?session_id=test-123&user_input=Hello"
        )
        
        # Assertions
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream; charset=utf-8"
    
    @patch('services.firebase_service.firebase_service.store_message')
    @patch('services.firebase_service.firebase_service.get_chat_history')
    @patch('services.openai_service.openai_service.stream_chat_completion')
    def test_chat_stream_error_handling(
        self, 
        mock_stream_completion, 
        mock_get_history, 
        mock_store_message
    ):
        """Test chat streaming error handling."""
        # Setup mocks
        mock_get_history.return_value = []
        
        # Create a proper async generator that raises an exception
        async def mock_error_generator():
            yield "Starting..."
            raise Exception("OpenAI API error")
        
        mock_stream_completion.return_value = mock_error_generator()
        
        # Make request
        response = client.get(
            "/chat/stream?session_id=test-123&user_input=Hello"
        )
        
        # Should still return 200 as errors are handled in the stream
        assert response.status_code == 200


@pytest.fixture
def chat_request_data():
    """Fixture for chat request data."""
    return {
        "session_id": "test-session-123",
        "user_input": "Hello, how are you?"
    }


def test_chat_request_model_validation():
    """Test ChatRequest model validation."""
    # Valid data
    valid_request = ChatRequest(
        session_id="test-123",
        user_input="Hello"
    )
    assert valid_request.session_id == "test-123"
    assert valid_request.user_input == "Hello"
    
    # Invalid data
    with pytest.raises(Exception):
        ChatRequest(session_id="test-123")  # Missing user_input
    
    with pytest.raises(Exception):
        ChatRequest(user_input="Hello")  # Missing session_id