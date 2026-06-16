"""
Morgan's Hope CXR AI Service
Port: 8001  |  POST /predict/xray

This service expects the new Chest X-Ray pipeline:
- a multi-disease classifier that returns 6 clinical groups
- an optional TB pipeline with Stage 1 classification and Stage 2 lesion localization
"""
import io
import logging
import os
import shutil
import time
from pathlib import Path
from typing import Dict, List, Optional

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)-8s %(message)s")
log = logging.getLogger("xray_service")

IMAGE_SIZE = int(os.environ.get("XRAY_IMAGE_SIZE", "224"))
XRAY_HF_REPO = os.environ.get("XRAY_HF_REPO", "")
TB_HF_REPO = os.environ.get("TB_HF_REPO", "")
TB_LOCALIZER_HF_REPO = os.environ.get("TB_LOCALIZER_HF_REPO", "")
ALLOW_TB_ONLY_FALLBACK = os.environ.get("ALLOW_TB_ONLY_FALLBACK", "true").lower() == "true"

CLINICAL_GROUPS = [
    "Pulmonary Infection",
    "COPD-related Findings",
    "Fibrotic Lung Disease",
    "Cardiac Conditions",
    "Potential Malignancy Findings",
    "Pleural Diseases",
]

NEXT_STEPS = {
    "Pulmonary Infection": "Clinical correlation and infection workup are recommended.",
    "COPD-related Findings": "Pulmonary function assessment and pulmonology follow-up are recommended.",
    "Fibrotic Lung Disease": "Consider pulmonology review and high-resolution CT when clinically indicated.",
    "Cardiac Conditions": "Cardiology evaluation may be needed depending on symptoms and history.",
    "Potential Malignancy Findings": "Urgent physician review and CT scan are strongly recommended.",
    "Pleural Diseases": "Clinical review and follow-up imaging are recommended.",
}

TRANSFORM = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

app = FastAPI(title="Morgan's Hope CXR Service", version="4.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_xray_model = None
_tb_model = None
_tb_localizer = None


def resolve_model_path(env_name: str, default_filename: str, repo_id: str = "") -> Optional[Path]:
    env = os.environ.get(env_name, "")
    if env and Path(env).exists():
        return Path(env)

    local = Path(__file__).parent / default_filename
    if local.exists():
        return local

    if repo_id:
        from huggingface_hub import hf_hub_download

        dest = Path(__file__).parent / default_filename
        shutil.copy(hf_hub_download(repo_id=repo_id, filename=default_filename), dest)
        return dest

    return None


def load_torchscript(path: Path):
    model = torch.jit.load(str(path), map_location="cpu")
    model.eval()
    return model


def get_xray_model():
    global _xray_model
    if _xray_model:
        return _xray_model

    model_path = resolve_model_path("XRAY_MODEL_PATH", "model.pt", XRAY_HF_REPO)
    if not model_path:
        raise RuntimeError("CXR clinical groups model is not configured.")

    _xray_model = load_torchscript(model_path)
    log.info("CXR clinical groups model ready.")
    return _xray_model


def get_tb_model():
    global _tb_model
    if _tb_model:
        return _tb_model

    model_path = resolve_model_path("TB_MODEL_PATH", "tb_model.pt", TB_HF_REPO)
    if not model_path:
        return None

    _tb_model = load_torchscript(model_path)
    log.info("TB Stage 1 classifier model ready.")
    return _tb_model


def get_tb_localizer():
    global _tb_localizer
    if _tb_localizer:
        return _tb_localizer

    model_path = resolve_model_path("TB_LOCALIZER_MODEL_PATH", "tb_localizer.pt", TB_LOCALIZER_HF_REPO)
    if not model_path:
        return None

    from ultralytics import YOLO

    _tb_localizer = YOLO(str(model_path))
    log.info("TB Stage 2 localizer model ready.")
    return _tb_localizer


def predict_probabilities(model, tensor) -> Dict[str, float]:
    with torch.no_grad():
        logits = model(tensor)
        probabilities = torch.softmax(logits, dim=1)[0].tolist()

    if len(probabilities) != len(CLINICAL_GROUPS):
        raise RuntimeError(
            f"CXR model returned {len(probabilities)} classes, expected {len(CLINICAL_GROUPS)} clinical groups."
        )

    return {label: round(float(probability), 6) for label, probability in zip(CLINICAL_GROUPS, probabilities)}


def predict_tb(tensor) -> Optional[Dict[str, object]]:
    model = get_tb_model()
    if not model:
        return None

    with torch.no_grad():
        logits = model(tensor)
        if isinstance(logits, (tuple, list)):
            logits = logits[0]
        if logits.ndim == 1:
            logits = logits.unsqueeze(0)

    if logits.shape[1] == 1:
        confidence = round(float(torch.sigmoid(logits)[0][0].item()), 6)
    else:
        probabilities = torch.softmax(logits, dim=1)[0].tolist()
        confidence = round(float(probabilities[-1]), 6)

    return {
        "detected": confidence >= float(os.environ.get("TB_THRESHOLD", "0.5")),
        "confidence": confidence,
    }


def localize_tb(image: Image.Image) -> Optional[List[Dict]]:
    model = get_tb_localizer()
    if not model:
        return None

    conf = float(os.environ.get("TB_LOCALIZER_CONF", "0.25"))
    iou = float(os.environ.get("TB_LOCALIZER_IOU", "0.5"))
    results = model(image, conf=conf, iou=iou)
    detections: List[Dict] = []

    for result in results:
        boxes = getattr(result, "boxes", None)
        if boxes is None:
            continue
        for box in boxes:
            xyxy = box.xyxy[0].tolist()
            confidence = float(box.conf[0].item()) if box.conf is not None else 0.0
            x1, y1, x2, y2 = [float(value) for value in xyxy]
            detections.append({
                "bounding_box": {
                    "x": round(x1, 2),
                    "y": round(y1, 2),
                    "width": round(max(0.0, x2 - x1), 2),
                    "height": round(max(0.0, y2 - y1), 2),
                },
                "confidence": round(confidence, 4),
            })

    detections.sort(key=lambda item: item["confidence"], reverse=True)
    return detections


@app.on_event("startup")
async def startup():
    try:
        get_xray_model()
    except Exception as exc:
        log.warning("CXR model not ready: %s", exc)

    try:
        get_tb_model()
    except Exception as exc:
        log.warning("TB Stage 1 model not ready: %s", exc)

    try:
        get_tb_localizer()
    except Exception as exc:
        log.warning("TB Stage 2 localizer not ready: %s", exc)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "cxr",
        "clinical_groups_model_loaded": _xray_model is not None,
        "tb_stage1_model_loaded": _tb_model is not None,
        "tb_stage2_localizer_loaded": _tb_localizer is not None,
        "tb_only_fallback_enabled": ALLOW_TB_ONLY_FALLBACK,
        "classes": CLINICAL_GROUPS,
    }


@app.post("/predict/xray")
async def predict_xray(file: UploadFile = File(...)) -> Dict:
    t0 = time.time()
    try:
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    except Exception as exc:
        raise HTTPException(400, f"Cannot open image: {exc}")

    tensor = TRANSFORM(image).unsqueeze(0)

    tb_result = None
    try:
        tb_result = predict_tb(tensor)
        if tb_result and tb_result.get("detected"):
            tb_result["localizations"] = localize_tb(image)
    except Exception as exc:
        log.warning("TB pipeline unavailable: %s", exc)

    try:
        probabilities = predict_probabilities(get_xray_model(), tensor)
    except Exception as exc:
        if not ALLOW_TB_ONLY_FALLBACK:
            raise HTTPException(503, f"CXR model unavailable: {exc}")

        confidence = float(tb_result["confidence"]) if tb_result else 0.0
        detected = bool(tb_result and tb_result.get("detected"))
        return {
            "has_finding": detected,
            "diagnosis": "Tuberculosis Screening Signal" if detected else "Chest X-Ray Review Needed",
            "clinical_group": "Pulmonary Infection" if detected else None,
            "confidence": confidence,
            "tb_result": tb_result,
            "next_step": (
                "TB screening signal detected. Physician review and confirmatory testing are recommended."
                if detected
                else "NIH14 clinical-groups model is not configured yet. Physician review is recommended."
            ),
            "all_probs": {},
            "model_output_type": "tb_only_pending_clinical_groups",
            "processing_ms": int((time.time() - t0) * 1000),
        }

    clinical_group = max(probabilities, key=probabilities.get)
    confidence = probabilities[clinical_group]

    return {
        "has_finding": True,
        "diagnosis": clinical_group,
        "clinical_group": clinical_group,
        "confidence": confidence,
        "tb_result": tb_result,
        "next_step": NEXT_STEPS.get(clinical_group),
        "all_probs": probabilities,
        "model_output_type": "clinical_groups",
        "processing_ms": int((time.time() - t0) * 1000),
    }
