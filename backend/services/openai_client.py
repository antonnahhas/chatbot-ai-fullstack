import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

async def stream_chat_completion(history):
    # Make sure history is a list of {"role": "user"|"assistant", "content": "..."}
    response = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo",
        messages=history,
        stream=True,
    )

    async for chunk in response:
        content = chunk.choices[0].delta.get("content", "")
        if content:
            yield content