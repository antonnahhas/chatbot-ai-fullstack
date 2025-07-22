# services/auth_service.py
"""
Simplified authentication service for managing user sessions.
"""

from typing import Optional, Dict
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config.settings import settings
import secrets
import uuid
import logging

logger = logging.getLogger(__name__)

# Security configurations
SECRET_KEY = settings.secret_key or secrets.token_urlsafe(32)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days for anonymous users

# Bearer token scheme
bearer_scheme = HTTPBearer(auto_error=False)


class AuthService:
    """
    Simplified service for handling authentication without Firebase.
    """
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a JWT access token.
        """
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Dict[str, any]:
        """
        Verify and decode a JWT token.
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    async def create_anonymous_user(self) -> Dict[str, str]:
        """
        Create an anonymous user with a UUID.
        """
        try:
            # Generate a unique user ID
            user_id = f"anon_{uuid.uuid4()}"
            
            # Create JWT token
            access_token = self.create_access_token(
                data={"sub": user_id, "type": "anonymous"}
            )
            
            logger.info(f"Created anonymous user: {user_id}")
            return {
                "user_id": user_id,
                "access_token": access_token,
                "token_type": "bearer"
            }
            
        except Exception as e:
            logger.error(f"Error creating anonymous user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create anonymous user"
            )
    
    async def get_current_user_optional(
        self, 
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)
    ) -> Optional[str]:
        """
        Get the current user from the JWT token (optional - returns None if no token).
        """
        if not credentials:
            return None
            
        try:
            token = credentials.credentials
            payload = self.verify_token(token)
            return payload.get("sub")
        except:
            return None
    
    async def get_current_user(
        self, 
        credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
    ) -> str:
        """
        Get the current user from the JWT token (required).
        """
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
            )
            
        token = credentials.credentials
        payload = self.verify_token(token)
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        
        return user_id


# Create singleton instance
auth_service = AuthService()