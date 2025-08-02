# tests/test_services.py
"""
Tests for service layer components.
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from services.firebase_service import FirebaseService
from services.openai_service import OpenAIService
from utils.constants import DEFAULT_CHAT_TITLE, TITLE_WORD_LIMIT
import asyncio


class TestFirebaseService:
    """Test suite for Firebase service."""
    
    @pytest.fixture
    def firebase_service(self):
        """Create Firebase service instance with mocked db."""
        with patch('services.firebase_service.get_firebase_app'):
            with patch('services.firebase_service.firestore.client'):
                service = FirebaseService()
                # Mock the database client
                service.db = MagicMock()
                return service
    
    def test_store_message_user(self, firebase_service):
        """Test storing a user message."""
        # Setup mocks
        mock_chat_ref = MagicMock()
        mock_messages_ref = MagicMock()
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"title": DEFAULT_CHAT_TITLE}
        
        firebase_service.db.collection.return_value.document.return_value = mock_chat_ref
        mock_chat_ref.collection.return_value = mock_messages_ref
        mock_chat_ref.get.return_value = mock_doc
        
        # Execute - use a message with more than 4 words
        test_message = "Hello world this is a test message"
        firebase_service.store_message("test-123", "user", test_message)
        
        # Assertions
        mock_messages_ref.add.assert_called_once()
        call_args = mock_messages_ref.add.call_args[0][0]
        assert call_args["role"] == "user"
        assert call_args["content"] == test_message
        assert "timestamp" in call_args
        
        # Title should be updated with first 4 words
        expected_title = "Hello world this is..."
        mock_chat_ref.update.assert_called_once_with({"title": expected_title})
    
    def test_store_message_assistant(self, firebase_service):
        """Test storing an assistant message."""
        # Setup mocks
        mock_chat_ref = MagicMock()
        mock_messages_ref = MagicMock()
        
        firebase_service.db.collection.return_value.document.return_value = mock_chat_ref
        mock_chat_ref.collection.return_value = mock_messages_ref
        
        # Execute
        firebase_service.store_message("test-123", "assistant", "I'm here to help!")
        
        # Assertions
        mock_messages_ref.add.assert_called_once()
        # Title should NOT be updated for assistant messages
        mock_chat_ref.get.assert_not_called()
        mock_chat_ref.update.assert_not_called()
    
    def test_update_chat_title_short_message(self, firebase_service):
        """Test title update with short message."""
        mock_chat_ref = MagicMock()
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"title": DEFAULT_CHAT_TITLE}
        mock_chat_ref.get.return_value = mock_doc
        
        # Execute with short message
        firebase_service._update_chat_title_if_needed(mock_chat_ref, "Hi there")
        
        # Should not add ellipsis for short messages
        mock_chat_ref.update.assert_called_once_with({"title": "Hi there"})
    
    def test_get_chat_history(self, firebase_service):
        """Test retrieving chat history."""
        # Setup mocks
        mock_docs = [
            MagicMock(to_dict=lambda: {"role": "user", "content": "Hello"}),
            MagicMock(to_dict=lambda: {"role": "assistant", "content": "Hi!"})
        ]
        
        mock_chat_ref = MagicMock()
        mock_messages_ref = MagicMock()
        mock_messages_ref.order_by.return_value.stream.return_value = mock_docs
        
        firebase_service.db.collection.return_value.document.return_value.collection.return_value = mock_messages_ref
        
        # Execute
        history = firebase_service.get_chat_history("test-123")
        
        # Assertions
        assert len(history) == 2
        assert history[0]["role"] == "user"
        assert history[0]["content"] == "Hello"
        assert history[1]["role"] == "assistant"
        assert history[1]["content"] == "Hi!"
    
    def test_create_session_with_id(self, firebase_service):
        """Test creating a session with provided ID."""
        mock_doc_ref = MagicMock()
        firebase_service.db.collection.return_value.document.return_value = mock_doc_ref
        
        # Execute
        session_id = firebase_service.create_session("custom-id")
        
        # Assertions
        assert session_id == "custom-id"
        mock_doc_ref.set.assert_called_once()
        call_args = mock_doc_ref.set.call_args[0][0]
        assert "created_at" in call_args
        assert call_args["title"] == DEFAULT_CHAT_TITLE
    
    def test_create_session_without_id(self, firebase_service):
        """Test creating a session without provided ID."""
        mock_doc_ref = MagicMock()
        firebase_service.db.collection.return_value.document.return_value = mock_doc_ref
        
        # Execute
        session_id = firebase_service.create_session()
        
        # Assertions
        assert session_id is not None
        assert len(session_id) == 36  # UUID format
        mock_doc_ref.set.assert_called_once()
    
    def test_delete_session(self, firebase_service):
        """Test deleting a session."""
        # Setup mocks
        mock_session_ref = MagicMock()
        mock_messages_ref = MagicMock()
        mock_batch = MagicMock()
        
        mock_messages = [MagicMock(reference="msg1"), MagicMock(reference="msg2")]
        mock_messages_ref.stream.return_value = mock_messages
        
        firebase_service.db.collection.return_value.document.return_value = mock_session_ref
        firebase_service.db.batch.return_value = mock_batch
        mock_session_ref.collection.return_value = mock_messages_ref
        
        # Execute
        firebase_service.delete_session("test-123")
        
        # Assertions
        assert mock_batch.delete.call_count == 2
        mock_batch.commit.assert_called_once()
        mock_session_ref.delete.assert_called_once()


class TestOpenAIService:
    """Test suite for OpenAI service."""
    
    @pytest.fixture
    def openai_service(self):
        """Create OpenAI service instance."""
        with patch('services.openai_service.settings'):
            service = OpenAIService()
            return service
    
    @pytest.mark.asyncio
    async def test_stream_chat_completion_success(self, openai_service):
        """Test successful streaming completion."""
        # Setup mock
        with patch('services.openai_service.openai.ChatCompletion.acreate') as mock_create:
            # Create proper mock objects
            class MockDelta:
                def get(self, key, default=None):
                    if key == "content":
                        return self.content
                    return default
            
            class MockChoice:
                def __init__(self, content):
                    self.delta = MockDelta()
                    self.delta.content = content
            
            class MockChunk:
                def __init__(self, content):
                    self.choices = [MockChoice(content)]
            
            # Mock async generator
            async def mock_stream():
                chunks = [MockChunk("Hello"), MockChunk(" there!")]
                for chunk in chunks:
                    yield chunk
            
            mock_create.return_value = mock_stream()
            
            # Execute
            history = [{"role": "user", "content": "Hi"}]
            result = []
            async for chunk in openai_service.stream_chat_completion(history):
                result.append(chunk)
            
            # Assertions
            assert result == ["Hello", " there!"]
            mock_create.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_stream_chat_completion_error(self, openai_service):
        """Test error handling in streaming completion."""
        # Setup mock to raise exception
        with patch('services.openai_service.openai.ChatCompletion.acreate') as mock_create:
            mock_create.side_effect = Exception("API Error")
            
            # Execute
            history = [{"role": "user", "content": "Hi"}]
            result = []
            async for chunk in openai_service.stream_chat_completion(history):
                result.append(chunk)
            
            # Should yield error message
            assert len(result) == 1
            assert "Error:" in result[0]


@pytest.fixture
def mock_firestore_db():
    """Fixture for mocked Firestore database."""
    with patch('firebase_admin.firestore.client') as mock_client:
        yield mock_client.return_value