"""
Morgan's Hope CXR AI Service
Port: 8001  |  POST /predict/xray

This service expects the new Chest X-Ray pipeline:
- a 7-class multi-label classifier that includes No Finding
- a dedicated TB classifier
- an optional TB localizer for box rendering
"""
import io
import json
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

CXR_CONFIG_CLASS_ORDER = [
    "Pulmonary_Infection",
    "COPD_Related_Findings",
    "Fibrotic_Lung_Disease",
    "Cardiac_Conditions",
    "Potential_Malignancy",
    "Pleural_Diseases",
    "No_Finding",
]

CXR_CLASS_LABELS = {
    "Pulmonary_Infection": "Pulmonary Infection",
    "COPD_Related_Findings": "COPD-related Findings",
    "Fibrotic_Lung_Disease": "Fibrotic Lung Disease",
    "Cardiac_Conditions": "Cardiac Conditions",
    "Potential_Malignancy": "Potential Malignancy Findings",
    "Pleural_Diseases": "Pleural Diseases",
    "No_Finding": "No Finding",
}

NEXT_STEPS = {
    "Pulmonary Infection": "Clinical correlation and infection workup are recommended.",
    "COPD-related Findings": "Pulmonary function assessment and pulmonology follow-up are recommended.",
    "Fibrotic Lung Disease": "Consider pulmonology review and high-resolution CT when clinically indicated.",
    "Cardiac Conditions": "Cardiology evaluation may be needed depending on symptoms and history.",
    "Potential Malignancy Findings": "Urgent physician review and CT scan are strongly recommended.",
    "Pleural Diseases": "Clinical review and follow-up imaging are recommended.",
    "No Finding": "No major thoracic finding was flagged by the current X-ray model. Clinical review still matters.",
    "Tuberculosis (TB)": "TB screening signal detected. Physician review and confirmatory testing are recommended.",
}

TRANSFORM = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

app = FastAPI(title="Morgan's Hope CXR Service", version="5.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_xray_model = None
_tb_model = None
_tb_localizer = None
_xray_config = None


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


def get_xray_config():
    global _xray_config
    if _xray_config:
        return _xray_config

    config_path = resolve_model_path("XRAY_CONFIG_PATH", "xray_config_7class.json")
    if not config_path:
        _xray_config = {"optimal_thresholds": {}}
        return _xray_config

    with open(config_path, "r", encoding="utf-8") as handle:
        _xray_config = json.load(handle)

    log.info("CXR config loaded.")
    return _xray_config


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
        if isinstance(logits, (tuple, list)):
            logits = logits[0]
        if logits.ndim == 1:
            logits = logits.unsqueeze(0)
        probabilities = torch.sigmoid(logits)[0].tolist()

    if len(probabilities) != len(CXR_CONFIG_CLASS_ORDER):
        raise RuntimeError(
            f"CXR model returned {len(probabilities)} classes, expected {len(CXR_CONFIG_CLASS_ORDER)} classes."
        )

    return {
        raw_label: round(float(probability), 6)
        for raw_label, probability in zip(CXR_CONFIG_CLASS_ORDER, probabilities)
    }


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


def build_tb_priority_response(tb_result: Dict[str, object], processing_ms: int) -> Dict:
    return {
        "has_finding": True,
        "diagnosis": "Tuberculosis (TB)",
        "clinical_group": "Pulmonary Infection",
        "confidence": float(tb_result.get("confidence", 0.0)),
        "tb_result": tb_result,
        "next_step": NEXT_STEPS["Tuberculosis (TB)"],
        "all_probs": {},
        "positive_groups": ["Pulmonary Infection"],
        "applied_thresholds": {},
        "model_output_type": "tb_priority_over_clinical_groups",
        "processing_ms": processing_ms,
    }


@app.on_event("startup")
async def startup():
    try:
        get_xray_model()
    except Exception as exc:
        log.warning("CXR model not ready: %s", exc)

    try:
        get_xray_config()
    except Exception as exc:
        log.warning("CXR config not ready: %s", exc)

    try:
        get_tb_model()
    except Exception as exc:
        log.warning("TB Stage 1 model not ready: %s", exc)

    try:
        get_tb_localizer()
    except Exception as exc:
        log.warning("TB Stage 2 localizer model not ready: %s", exc)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "cxr",
        "clinical_groups_model_loaded": _xray_model is not None,
        "tb_stage1_model_loaded": _tb_model is not None,
        "tb_stage2_localizer_loaded": _tb_localizer is not None,
        "tb_only_fallback_enabled": ALLOW_TB_ONLY_FALLBACK,
        "classes": list(CXR_CLASS_LABELS.values()),
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
        probabilities_raw = predict_probabilities(get_xray_model(), tensor)
    except Exception as exc:
        if not ALLOW_TB_ONLY_FALLBACK:
            raise HTTPException(503, f"CXR model unavailable: {exc}")

        if tb_result and tb_result.get("detected"):
            return build_tb_priority_response(tb_result, int((time.time() - t0) * 1000))

        return {
            "has_finding": False,
            "diagnosis": "Chest X-Ray Review Needed",
            "clinical_group": None,
            "confidence": 0.0,
            "tb_result": tb_result,
            "next_step": "NIH14 clinical-groups model is not configured yet. Physician review is recommended.",
            "all_probs": {},
            "positive_groups": [],
            "applied_thresholds": {},
            "model_output_type": "tb_only_pending_clinical_groups",
            "processing_ms": int((time.time() - t0) * 1000),
        }

    xray_config = get_xray_config()
    thresholds = xray_config.get("optimal_thresholds", {})
    threshold_hits = {
        raw_label: probabilities_raw[raw_label] >= float(thresholds.get(raw_label, 0.5))
        for raw_label in CXR_CONFIG_CLASS_ORDER
    }
    probabilities = {
        CXR_CLASS_LABELS[raw_label]: probabilities_raw[raw_label]
        for raw_label in CXR_CONFIG_CLASS_ORDER
    }

    disease_raw_labels = [raw_label for raw_label in CXR_CONFIG_CLASS_ORDER if raw_label != "No_Finding"]
    positive_raw_labels = [
        raw_label for raw_label in disease_raw_labels
        if threshold_hits.get(raw_label, False)
    ]
    no_finding_conf = probabilities_raw.get("No_Finding", 0.0)
    no_finding_active = threshold_hits.get("No_Finding", False)
    best_disease_raw = max(disease_raw_labels, key=lambda raw_label: probabilities_raw[raw_label])
    best_disease_conf = probabilities_raw[best_disease_raw]
    tb_detected = bool(tb_result and tb_result.get("detected"))
    tb_conf = float(tb_result.get("confidence", 0.0)) if tb_result else 0.0

    if tb_detected and tb_conf >= max(best_disease_conf, no_finding_conf):
        return {
            "has_finding": True,
            "diagnosis": "Tuberculosis (TB)",
            "clinical_group": "Pulmonary Infection",
            "confidence": tb_conf,
            "tb_result": tb_result,
            "next_step": NEXT_STEPS["Tuberculosis (TB)"],
            "all_probs": probabilities,
            "positive_groups": ["Pulmonary Infection"],
            "applied_thresholds": thresholds,
            "model_output_type": "tb_priority_over_clinical_groups",
            "processing_ms": int((time.time() - t0) * 1000),
        }

    if not positive_raw_labels and no_finding_active and not tb_detected:
        return {
            "has_finding": False,
            "diagnosis": "No Finding",
            "clinical_group": None,
            "confidence": no_finding_conf,
            "tb_result": tb_result,
            "next_step": NEXT_STEPS["No Finding"],
            "all_probs": probabilities,
            "positive_groups": [],
            "applied_thresholds": thresholds,
            "model_output_type": "clinical_groups_7class_multilabel",
            "processing_ms": int((time.time() - t0) * 1000),
        }

    if positive_raw_labels:
        selected_raw = max(positive_raw_labels, key=lambda raw_label: probabilities_raw[raw_label])
    elif no_finding_active and no_finding_conf >= best_disease_conf and not tb_detected:
        selected_raw = "No_Finding"
    else:
        selected_raw = best_disease_raw

    diagnosis = CXR_CLASS_LABELS[selected_raw]
    has_finding = diagnosis != "No Finding"

    return {
        "has_finding": has_finding,
        "diagnosis": diagnosis,
        "clinical_group": None if diagnosis == "No Finding" else diagnosis,
        "confidence": probabilities[diagnosis],
        "tb_result": tb_result,
        "next_step": NEXT_STEPS.get(diagnosis),
        "all_probs": probabilities,
        "positive_groups": [CXR_CLASS_LABELS[raw_label] for raw_label in positive_raw_labels],
        "applied_thresholds": thresholds,
        "model_output_type": "clinical_groups_7class_multilabel",
        "processing_ms": int((time.time() - t0) * 1000),
    }
