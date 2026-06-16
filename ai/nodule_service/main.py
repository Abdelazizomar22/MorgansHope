"""
Morgan's Hope CT Nodule Detection Service
Port: 8003 | POST /detect
"""
import io
import logging
import os
import time
from pathlib import Path
from typing import Dict, List

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)-8s %(message)s")
log = logging.getLogger("nodule_service")

app = FastAPI(title="Morgan's Hope CT Nodule Detection Service", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_model = None


def get_model():
    global _model
    if _model:
        return _model

    model_path = os.environ.get("NODULE_MODEL_PATH", "")
    if not model_path or not Path(model_path).exists():
        local = Path(__file__).parent / "model.pt"
        model_path = str(local) if local.exists() else ""

    if not model_path:
        raise RuntimeError("Nodule model is not configured. Set NODULE_MODEL_PATH or add model.pt.")

    from ultralytics import YOLO

    _model = YOLO(model_path)
    log.info("Nodule detector ready: %s", model_path)
    return _model


@app.on_event("startup")
async def startup():
    try:
        get_model()
    except Exception as exc:
        log.warning("Nodule model not loaded at startup: %s", exc)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "YOLO CT Nodule Detection",
        "loaded": _model is not None,
    }


def estimate_size_mm(width_px: float, height_px: float) -> float:
    pixel_spacing_mm = float(os.environ.get("NODULE_PIXEL_SPACING_MM", "0.625"))
    return round(max(width_px, height_px) * pixel_spacing_mm, 2)


@app.post("/detect")
async def detect(file: UploadFile = File(...)) -> Dict:
    t0 = time.time()
    try:
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    except Exception as exc:
        raise HTTPException(400, f"Cannot open image: {exc}")

    try:
        conf = float(os.environ.get("NODULE_CONF_THRESHOLD", "0.25"))
        iou = float(os.environ.get("NODULE_IOU_THRESHOLD", "0.45"))
        results = get_model()(image, conf=conf, iou=iou)
    except Exception as exc:
        log.error("Nodule detection error: %s", exc)
        raise HTTPException(503, "Nodule detector unavailable.")

    detections: List[Dict] = []
    for result in results:
        boxes = getattr(result, "boxes", None)
        if boxes is None:
            continue
        for box in boxes:
            xyxy = box.xyxy[0].tolist()
            confidence = float(box.conf[0].item()) if box.conf is not None else 0.0
            x1, y1, x2, y2 = [float(value) for value in xyxy]
            width = max(0.0, x2 - x1)
            height = max(0.0, y2 - y1)
            detections.append({
                "bounding_box": {
                    "x": round(x1, 2),
                    "y": round(y1, 2),
                    "width": round(width, 2),
                    "height": round(height, 2),
                },
                "size_mm": estimate_size_mm(width, height),
                "confidence": round(confidence, 4),
            })

    detections.sort(key=lambda item: item["confidence"], reverse=True)

    return {
        "detections": detections,
        "best_detection": detections[0] if detections else None,
        "processing_ms": int((time.time() - t0) * 1000),
    }
