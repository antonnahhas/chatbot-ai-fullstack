from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_chat_completion(messages: list[dict]) -> str:
    response = client.chat.completions.create(
        model="gpt-4-turbo", 
        messages=messages,
        temperature=0.7,
    )

    return response.choices[0].message.content
