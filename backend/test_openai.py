import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        raise ValueError("OPENAI_API_KEY is missing or invalid in .env")
    return OpenAI(
        api_key=api_key,
    )

if __name__ == "__main__":
    try:
        client = get_openai_client()
        response = client.chat.completions.create(
            model="gpt-4o-mini", # OpenAI model
            messages=[
                {"role": "user", "content": "Say hello!"}
            ],
            max_tokens=200
        )
        print("OpenAI API Test Successful:", response.choices[0].message.content)
    except Exception as e:
        print("OpenAI API Test Failed:", e)
