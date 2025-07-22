# tests/conftest.py
"""
Pytest configuration and shared fixtures.
"""

import pytest
import asyncio
from typing import Generator
import sys
import os

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
    yield


@pytest.fixture
def test_session_id():
    """Provide a test session ID."""
    return "test-session-123"


@pytest.fixture
def sample_chat_history():
    """Provide sample chat history."""
    return [
        {"role": "user", "content": "Hello, how are you?"},
        {"role": "assistant", "content": "I'm doing well, thank you! How can I help you today?"},
        {"role": "user", "content": "Can you explain Python?"},
    ]