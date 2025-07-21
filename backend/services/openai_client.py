import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_chat_completion(history: list[dict]) -> str:
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=history
    )
    return response.choices[0].message.content
