from huggingface_hub import snapshot_download
import os

repo_id = "unsloth/mistral-7b-bnb-4bit"
# Set the local_dir to the desired absolute path
local_dir = "/home/tanish/LocalLLMS/mistral-7b-bnb-4bit-local"

# Create the directory if it doesn't exist
# os.makedirs will create all necessary parent directories (like LocalLLMS) if they don't exist.
os.makedirs(local_dir, exist_ok=True)

print(f"Downloading files from {repo_id} to {local_dir}...")
snapshot_download(repo_id=repo_id, local_dir=local_dir)

print(f"All files downloaded to: {local_dir}")

