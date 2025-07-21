import os
from fastapi import FastAPI
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials, firestore

# Load .env
load_dotenv()

# Initialize Firebase
cred_path = os.getenv("FIREBASE_CREDENTIALS")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

# Create Firestore client
db = firestore.client()

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend 🚀"}

@app.get("/test-firestore")
def test_firestore():
    # Example: read a document from collection "test"
    doc_ref = db.collection("test").document("sample")
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict()
    else:
        return {"error": "Document not found"}