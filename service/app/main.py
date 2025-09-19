import base64
import io
import os
import re
from typing import List, Optional

import google.generativeai as genai
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Configure Gemini SDK once at startup
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY or GOOGLE_API_KEY must be set as an environment variable")

genai.configure(api_key=GEMINI_API_KEY)

MODEL_ID = os.getenv("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image-preview")

# Basic settings
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]

app = FastAPI(title="Image Generation Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="Text prompt for image generation")


class EditRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="Editing instruction")
    images: List[str] = Field(..., min_items=1, description="List of base64 data URLs or HTTP(S) URLs")


class ImageResponse(BaseModel):
    imageBase64: str
    modelId: str


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "modelId": MODEL_ID}


def _extract_inline_image_base64(response) -> Optional[str]:
    """Return first image bytes from response.parts as base64 string."""
    parts = getattr(response, "parts", [])
    for part in parts:
        inline = getattr(part, "inline_data", None)
        if inline and getattr(inline, "data", None):
            b = inline.data
            return base64.b64encode(b).decode("utf-8")
    return None


@app.post("/generate", response_model=ImageResponse)
async def generate(req: GenerateRequest, request: Request):
    try:
        model = genai.GenerativeModel(MODEL_ID)
        response = model.generate_content(req.prompt)
        b64 = _extract_inline_image_base64(response)
        if not b64:
            # Some responses may not include image bytes if the model returns text explanation
            # or a safety block. Return 422 in that case.
            raise HTTPException(status_code=422, detail="No image returned by the model. Try refining the prompt.")
        return ImageResponse(imageBase64=b64, modelId=MODEL_ID)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}")


DATA_URL_RE = re.compile(r"^data:(?P<mime>image/\w+);base64,(?P<data>[A-Za-z0-9+/=]+)$")


async def _load_image_bytes(item: str) -> bytes:
    # Supports data URLs and http(s) URLs
    m = DATA_URL_RE.match(item)
    if m:
        return base64.b64decode(m.group("data"))
    if item.startswith("http://") or item.startswith("https://"):
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(item)
            r.raise_for_status()
            return r.content
    # Otherwise assume it's base64 without data URL prefix
    try:
        return base64.b64decode(item)
    except Exception:
        raise HTTPException(status_code=400, detail="Unsupported image format. Provide a data URL, URL, or base64 string.")


@app.post("/edit", response_model=ImageResponse)
async def edit(req: EditRequest, request: Request):
    try:
        # Load all provided images into memory as bytes and pass to the model via PIL.Image
        from PIL import Image

        pil_images = []
        for src in req.images:
            b = await _load_image_bytes(src)
            pil_images.append(Image.open(io.BytesIO(b)))

        contents = [req.prompt] + pil_images
        model = genai.GenerativeModel(MODEL_ID)
        response = model.generate_content(contents)
        b64 = _extract_inline_image_base64(response)
        if not b64:
            raise HTTPException(status_code=422, detail="No image returned by the model. Try refining the prompt or inputs.")
        return ImageResponse(imageBase64=b64, modelId=MODEL_ID)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Edit failed: {e}")
