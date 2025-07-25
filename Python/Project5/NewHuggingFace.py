import os
from huggingface_hub import InferenceClient

#model_name = "moonshotai/Kimi-K2-Instruct"
#model_name = "mistralai/Mistral-7B-Instruct-v0.2"
model_name = "meta-llama/Llama-3.1-8B-Instruct"
client = InferenceClient(model=model_name)
# Define the conversation messages
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Tell me a short story about a brave knight and a dragon."}
]

# Send the request
try:
    print("--- Sending request to Hugging Face Inference API ---")
    response = client.chat_completion(
        messages=messages,
        max_tokens=250,
        temperature=0.7,
    )
    print(f"DEBUG: Full API response object: {response}")

    print(f"\nRobot's Brain (via Inference API model: {model_name}) says:\n")
    if response and response.choices and len(response.choices) > 0 and response.choices[0].message:
        print(response.choices[0].message["content"])
    else:
        print("Error: The API response did not contain valid choices or message content.")
        print(f"Raw response: {response}")

except Exception as e:
    print(f"\nError interacting with Inference API: {e}")
