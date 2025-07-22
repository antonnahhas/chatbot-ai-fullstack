# tests/test_sessions.py
"""
Tests for session management endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app
from services.auth_service import auth_service
import uuid

client = TestClient(app)


class TestSessionEndpoints:
    """Test suite for session management endpoints."""
    
    @pytest.fixture(autouse=True)
    def setup_auth_override(self):
        """Override the auth dependency for all tests in this class."""
        def mock_get_current_user():
            return "test-user-123"
        
        def mock_get_current_user_optional():
            return "test-user-123"
        
        # Override the dependencies
        app.dependency_overrides[auth_service.get_current_user] = mock_get_current_user
        app.dependency_overrides[auth_service.get_current_user_optional] = mock_get_current_user_optional
        
        yield
        
        # Clean up after test
        app.dependency_overrides.clear()
    
    @patch('services.firebase_service.firebase_service.list_user_sessions')
    def test_get_all_sessions_success(self, mock_list_sessions):
        """Test successful retrieval of all sessions."""
        # Setup mock
        mock_list_sessions.return_value = [
            {"session_id": "123", "title": "Test Chat 1"},
            {"session_id": "456", "title": "Test Chat 2"}
        ]
        
        # Make request
        response = client.get("/chats")
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert "sessions" in data
        assert len(data["sessions"]) == 2
        assert data["sessions"][0]["id"] == "123"
        assert data["sessions"][0]["title"] == "Test Chat 1"
        # Verify the service was called with the mocked user ID
        mock_list_sessions.assert_called_once_with("test-user-123")
    
    @patch('services.firebase_service.firebase_service.list_user_sessions')
    def test_get_all_sessions_empty(self, mock_list_sessions):
        """Test retrieval when no sessions exist."""
        # Setup mock
        mock_list_sessions.return_value = []
        
        # Make request
        response = client.get("/chats")
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert "sessions" in data
        assert len(data["sessions"]) == 0
    
    @patch('services.firebase_service.firebase_service.list_user_sessions')
    def test_get_all_sessions_error(self, mock_list_sessions):
        """Test error handling when fetching sessions fails."""
        # Setup mock to raise exception
        mock_list_sessions.side_effect = Exception("Database error")
        
        # Make request
        response = client.get("/chats")
        
        # Assertions
        assert response.status_code == 500
        assert "Failed to fetch chat sessions" in response.json()["detail"]
    
    @patch('services.firebase_service.firebase_service.create_session')
    def test_create_chat_success(self, mock_create_session):
        """Test successful chat creation."""
        # Setup mock
        test_id = str(uuid.uuid4())
        mock_create_session.return_value = test_id
        
        # Make request
        response = client.post("/chats")
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert data["session_id"] == test_id
        # Verify the service was called with the user_id parameter
        mock_create_session.assert_called_once_with(user_id="test-user-123")
    
    @patch('services.firebase_service.firebase_service.create_session')
    def test_create_chat_error(self, mock_create_session):
        """Test error handling when chat creation fails."""
        # Setup mock to raise exception
        mock_create_session.side_effect = Exception("Database error")
        
        # Make request
        response = client.post("/chats")
        
        # Assertions
        assert response.status_code == 500
        assert "Failed to create chat session" in response.json()["detail"]
    
    @patch('services.firebase_service.firebase_service.get_chat_history')
    def test_get_session_messages_success(self, mock_get_history):
        """Test successful retrieval of session messages."""
        # Setup mock
        mock_get_history.return_value = [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there!"}
        ]
        
        # Make request
        response = client.get("/chats/test-123/messages")
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert len(data["messages"]) == 2
        assert data["messages"][0]["role"] == "user"
        assert data["messages"][1]["role"] == "assistant"
    
    @patch('services.firebase_service.firebase_service.get_chat_history')
    def test_get_session_messages_empty(self, mock_get_history):
        """Test retrieval when session has no messages."""
        # Setup mock
        mock_get_history.return_value = []
        
        # Make request
        response = client.get("/chats/test-123/messages")
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert "messages" in data
        assert len(data["messages"]) == 0
    
    @patch('services.firebase_service.firebase_service.get_chat_history')
    def test_get_session_messages_error(self, mock_get_history):
        """Test error handling when fetching messages fails."""
        # Setup mock to raise exception
        mock_get_history.side_effect = Exception("Database error")
        
        # Make request
        response = client.get("/chats/test-123/messages")
        
        # Assertions
        assert response.status_code == 500
        assert "Failed to fetch messages" in response.json()["detail"]
    
    @patch('services.firebase_service.firebase_service.delete_session')
    def test_delete_session_success(self, mock_delete_session):
        """Test successful session deletion."""
        # Make request
        response = client.delete("/chats/test-123")
        
        # Assertions
        assert response.status_code == 200
        assert response.json()["detail"] == "Session deleted successfully"
        mock_delete_session.assert_called_once_with("test-123")
    
    @patch('services.firebase_service.firebase_service.delete_session')
    def test_delete_session_error(self, mock_delete_session):
        """Test error handling when deletion fails."""
        # Setup mock to raise exception
        mock_delete_session.side_effect = Exception("Database error")
        
        # Make request
        response = client.delete("/chats/test-123")
        
        # Assertions
        assert response.status_code == 500
        assert "Failed to delete session" in response.json()["detail"]


class TestSessionEndpointsUnauthenticated:
    """Test suite for unauthenticated access to session endpoints."""
    
    def test_get_all_sessions_unauthorized(self):
        """Test that unauthenticated requests are rejected."""
        response = client.get("/chats")
        assert response.status_code == 401
    
    def test_create_chat_unauthorized(self):
        """Test that unauthenticated requests are rejected."""
        response = client.post("/chats")
        assert response.status_code == 401


@pytest.fixture
def sample_sessions():
    """Fixture for sample session data."""
    return [
        {
            "session_id": "test-123",
            "title": "Test Chat 1",
            "created_at": "2024-01-01T00:00:00"
        },
        {
            "session_id": "test-456",
            "title": "Test Chat 2",
            "created_at": "2024-01-02T00:00:00"
        }
    ]