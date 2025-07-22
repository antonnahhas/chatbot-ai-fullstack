# SumerAI Chatbot

A ChatGPT-style web application built with React, FastAPI, Firebase, and OpenAI.

## Features

- 💬 Real-time chat interface with streaming responses
- 🔐 Anonymous authentication for user privacy
- 💾 Persistent conversation history
- 🎨 Modern UI with TailwindCSS
- 🚀 Fast and scalable backend with FastAPI
- 🧠 Powered by OpenAI's GPT-3.5

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Python, FastAPI
- **Database**: Firebase Firestore
- **AI**: OpenAI GPT-3.5 API
- **Authentication**: JWT-based anonymous auth
- **Streaming**: Server-Sent Events (SSE)

## Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Firebase account
- OpenAI API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/chatbot-ai-fullstack.git
cd chatbot-ai-fullstack
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_secret_key_here_change_in_production
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Download your service account key:
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Save as `backend/config/firebase-key.json`

### 5. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

### 6. Run the Application

In separate terminals:

**Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm start
```

The app will be available at http://localhost:3000

## Project Structure

```
├── backend/
│   ├── api/
│   │   └── routes/         # API endpoints
│   ├── config/             # Configuration files
│   ├── models/             # Pydantic models
│   ├── services/           # Business logic
│   ├── utils/              # Utilities and constants
│   └── main.py             # FastAPI app entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/     # React components
    │   ├── hooks/          # Custom hooks
    │   ├── services/       # API services
    │   └── types/          # TypeScript types
    └── package.json
```

## API Endpoints

- `POST /auth/anonymous` - Create anonymous user session
- `GET /chats` - Get all user's chat sessions
- `POST /chats` - Create new chat session
- `GET /chats/{id}/messages` - Get messages for a chat
- `DELETE /chats/{id}` - Delete a chat session
- `GET /chat/stream` - Stream chat responses

## How It Works

1. **Authentication**: Users are automatically assigned an anonymous ID on first visit
2. **Chat Sessions**: Each user can have multiple isolated chat sessions
3. **Streaming**: Responses stream in real-time using Server-Sent Events
4. **Context**: Full conversation history is maintained for coherent responses

## Development

### Running Tests

```bash
cd backend
pytest
```

## Author

Anton Nahhas