# tests/conftest.py
"""
Pytest configuration and shared fixtures.
"""

import pytest
import asyncio
from typing import Generator
import sys
import os
from unittest.mock import patch

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_env_vars(monkeypatch):
    """Mock environment variables for testing."""
    monkeypatch.setenv("OPENAI_API_KEY", "test-api-key")
    monkeypatch.setenv("FIREBASE_KEY_PATH", "test-firebase-key.json")
    monkeypatch.setenv("SECRET_KEY", "test-secret-key-for-testing")
    yield


@pytest.fixture
def test_session_id():
    """Provide a test session ID."""
    return "test-session-123"


@pytest.fixture
def test_user_id():
    """Provide a test user ID."""
    return "test-user-123"


@pytest.fixture
def sample_chat_history():
    """Provide sample chat history."""
    return [
        {"role": "user", "content": "Hello, how are you?"},
        {"role": "assistant", "content": "I'm doing well, thank you! How can I help you today?"},
        {"role": "user", "content": "Can you explain Python?"},
    ]


@pytest.fixture
def mock_auth_service():
    """Mock the auth service for testing."""
    with patch('services.auth_service.auth_service') as mock_auth:
        # Set up default return values
        mock_auth.get_current_user.return_value = "test-user-123"
        mock_auth.get_current_user_optional.return_value = "test-user-123"
        mock_auth.verify_token.return_value = {"sub": "test-user-123", "type": "anonymous"}
        yield mock_auth


@pytest.fixture
def auth_headers():
    """Provide authorization headers for testing."""
    return {"Authorization": "Bearer test-token-123"}