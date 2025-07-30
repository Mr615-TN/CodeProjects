from pathlib import Path
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

model_path = Path("/home/tanish/LocalLLMS/mistral-7b-bnb-4bit-local").expanduser()

try:
    # 4-bit quantization config
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,  # ✅ 4-bit enabled
        bnb_4bit_quant_type="nf4",  # Use "nf4" (normal float 4)
        bnb_4bit_compute_dtype=torch.float16,  # Computation in float16
        llm_int8_enable_fp32_cpu_offload=True  # Optional: helps with memory
    )

    print(f"Loading model from: {model_path} with 4-bit quantization and CPU offload...")
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        quantization_config=bnb_config,
        device_map="auto",  # Let Accelerate handle placement
        torch_dtype=torch.float16  # Still use float16 where applicable
    )
    print("Model loaded successfully!")

    tokenizer = AutoTokenizer.from_pretrained(model_path)
    print("Tokenizer loaded successfully!")

    prompt = "What is the capital of France?"
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

    print(f"Generating response for: '{prompt}'")
    output = model.generate(inputs["input_ids"], max_new_tokens=50)
    response = tokenizer.decode(output[0], skip_special_tokens=True)
    print("\n--- Generated Response ---")
    print(response)
    print("--------------------------")

except Exception as e:
    print(f"An error occurred: {e}")
    print("\nMake sure the model supports 4-bit loading and is compatible with `transformers` + `bitsandbytes`.")

