# config/firebase.py
"""
Firebase configuration and initialization.
"""

import os
import firebase_admin
from firebase_admin import credentials, get_app, initialize_app
from config.settings import settings
import logging

logger = logging.getLogger(__name__)


def get_firebase_app():
    """
    Get or initialize Firebase app instance.
    
    Returns:
        Firebase app instance
        
    Raises:
        Exception: If Firebase initialization fails
        
    Note:
        Uses singleton pattern to ensure only one app instance
    """
    try:
        # Return existing app if already initialized
        return get_app()
        
    except ValueError:
        # Initialize new app
        try:
            cred_path = os.path.join(
                os.path.dirname(__file__), 
                settings.firebase_key_path
            )
            
            if not os.path.exists(cred_path):
                raise FileNotFoundError(
                    f"Firebase credentials file not found at: {cred_path}"
                )
            
            cred = credentials.Certificate(cred_path)
            app = initialize_app(cred)
            
            logger.info("Firebase app initialized successfully")
            return app
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            raise