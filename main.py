import os
from io import BytesIO

from dotenv import load_dotenv
from PIL import Image
import google.generativeai as genai

"""
Usage:
  1) Put your API key in Image-Generation-Tool/.env as either:
       GEMINI_API_KEY=...   (video style)
     or
       GOOGLE_API_KEY=...   (SDK default)
  2) From project root (where .venv lives):
       source .venv/bin/activate
       cd Image-Generation-Tool
       python main.py

This script generates a single image using the Gemini 2.5 Flash Image model
("Nano Banana"). Update model_id from AI Studio if needed.
"""

# Load environment variables from .env in this folder
load_dotenv()

# Prefer GEMINI_API_KEY if provided, else fall back to GOOGLE_API_KEY
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError(
        "Missing API key. Set GEMINI_API_KEY or GOOGLE_API_KEY in Image-Generation-Tool/.env"
    )

# Configure the client
genai.configure(api_key=api_key)

# Use the exact model ID shown in AI Studio (copy button). This is commonly:
#   gemini-2.5-flash-image-preview
# but may change over time. Update as needed.
model_id = os.getenv("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image-preview")
model = genai.GenerativeModel(model_id)

# Example prompt – change as you like
prompt = "create a photorealistic image of an orange cat with green eyes sitting on a couch"

print(f"Using model: {model_id}")
response = model.generate_content(prompt)

# Parse response parts for inline image data and save to disk
saved = False
for part in getattr(response, "parts", []):
    # Some responses include explanatory text
    if getattr(part, "text", None):
        print(part.text)

    inline = getattr(part, "inline_data", None)
    if inline and getattr(inline, "data", None):
        img = Image.open(BytesIO(inline.data))
        out_path = "cat.png"
        img.save(out_path)
        print(f"Image saved as {out_path}")
        saved = True

if not saved:
    print("No image bytes found in response. Full response follows:")
    try:
        # Response can be large; printing a summary-friendly form if available
        print(response)
    except Exception as e:
        print(f"Unable to print response: {e}")
