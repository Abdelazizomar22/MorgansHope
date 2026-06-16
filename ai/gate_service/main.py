"""
Morgan's Hope Pre-Classification Gate Service
Port: 8002 | POST /predict

Classes:
- Chest_XRay
- Chest_CT
- Other_Medical
- Non_Medical
"""
import io
import logging
import os
import shutil
import time
from pathlib import Path
from typing import Dict

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)-8s %(message)s")
log = logging.getLogger("gate_service")

CLASSES = ["Chest_CT", "Chest_XRay", "Non_Medical", "Other_Medical"]
IMAGE_SIZE = 224
HF_REPO = os.environ.get("GATE_HF_REPO", "")

TRANSFORM = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

app = FastAPI(title="Morgan's Hope Gate Service", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_model = None


def resolve_model_path():
    env = os.environ.get("GATE_MODEL_PATH", "")
    if env and Path(env).exists():
        log.info("Using GATE_MODEL_PATH: %s", env)
        return Path(env)

    local = Path(__file__).parent / "model.pt"
    if local.exists():
        log.info("Using local gate model: %s", local)
        return local

    return None


def download_hf():
    if not HF_REPO:
        return None

    from huggingface_hub import hf_hub_download

    log.info("Downloading gate model from HuggingFace: %s", HF_REPO)
    dest = Path(__file__).parent / "model.pt"
    shutil.copy(hf_hub_download(repo_id=HF_REPO, filename="model.pt"), dest)
    return dest


def get_model():
    global _model
    if _model:
        return _model

    model_path = resolve_model_path() or download_hf()
    if not model_path:
        raise RuntimeError("Gate model is not configured. Set GATE_MODEL_PATH or GATE_HF_REPO.")

    model = torch.jit.load(str(model_path), map_location="cpu")
    model.eval()
    _model = model
    log.info("Gate model ready.")
    return model


@app.on_event("startup")
async def startup():
    try:
        get_model()
    except Exception as exc:
        log.warning("Gate model not loaded at startup: %s", exc)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "Pre-Classification Gate EfficientNet-B0",
        "classes": CLASSES,
        "loaded": _model is not None,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> Dict:
    t0 = time.time()
    try:
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    except Exception as exc:
        raise HTTPException(400, f"Cannot open image: {exc}")

    tensor = TRANSFORM(image).unsqueeze(0)

    try:
        with torch.no_grad():
            logits = get_model()(tensor)
        if isinstance(logits, (tuple, list)):
            logits = logits[0]
        probabilities = torch.softmax(logits, dim=1)[0].tolist()
        pred_idx = int(torch.argmax(logits, dim=1).item())
    except Exception as exc:
        log.error("Gate inference error: %s", exc)
        raise HTTPException(503, "Gate model unavailable.")

    return {
        "classification": CLASSES[pred_idx],
        "confidence": round(float(probabilities[pred_idx]), 4),
        "all_probs": {CLASSES[i]: round(float(prob), 4) for i, prob in enumerate(probabilities)},
        "processing_ms": int((time.time() - t0) * 1000),
    }
