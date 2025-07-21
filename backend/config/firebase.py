import os
import firebase_admin
from firebase_admin import credentials, get_app, initialize_app
from dotenv import load_dotenv

load_dotenv()

def get_firebase_app():
    try:
        return get_app()
    except ValueError:
        cred_path = os.path.join(os.path.dirname(__file__), "../firebase-key.json")
        cred = credentials.Certificate(cred_path)
        return initialize_app(cred)
