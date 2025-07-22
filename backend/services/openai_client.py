import openai
import os
from dotenv import load_dotenv

load_dotenv()

# Set the API key
openai.api_key = os.getenv("OPENAI_API_KEY")

async def stream_chat_completion(history):
    """
    Stream chat completion from OpenAI
    Args:
        history: List of message dictionaries with 'role' and 'content'
    """
    try:
        # Create streaming chat completion using the older API
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=history,
            stream=True,
            temperature=0.7,
            max_tokens=1000
        )
        
        # Stream the response chunks
        async for chunk in response:
            content = chunk.choices[0].delta.get("content", "")
            if content:
                yield content
                
    except Exception as e:
        print(f"Error in OpenAI streaming: {e}")
        yield f"Error: {str(e)}"