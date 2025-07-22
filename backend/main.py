from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="SumerAI Chatbot API",
    description="A ChatGPT-style chatbot API with streaming responses",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes without prefix
app.include_router(router)

@app.get("/")
def root():
    return {
        "message": "SumerAI Chatbot API",
        "docs": "/docs",
        "health": "/health"
    }