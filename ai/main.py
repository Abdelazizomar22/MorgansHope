from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

from ct_service.main import health as ct_health, predict as ct_predict, get_model as get_ct_model
from gate_service.main import health as gate_health, predict as gate_predict, get_model as get_gate_model
from xray_service.main import (
    health as xray_health,
    predict_xray,
    get_xray_model,
    get_xray_config,
    get_tb_model,
    get_tb_localizer,
)
from nodule_service.main import health as nodule_health, detect as nodule_detect, get_model as get_nodule_model

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("morgans_hope_ai")

app = FastAPI(title="Morgan's Hope AI Services", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
async def startup():
    preload = os.environ.get("PRELOAD_AI_MODELS", "false").lower() == "true"
    if not preload:
        log.info("Lazy model loading enabled. Set PRELOAD_AI_MODELS=true to warm models at startup.")
        return

    loaders = [
        ("ct", get_ct_model),
        ("gate", get_gate_model),
        ("xray", get_xray_model),
        ("xray_config", get_xray_config),
        ("tb", get_tb_model),
        ("tb_localizer", get_tb_localizer),
        ("nodule", get_nodule_model),
    ]
    for name, loader in loaders:
        try:
            loader()
            log.info("%s model ready", name)
        except Exception as exc:
            log.warning("%s model not ready at startup: %s", name, exc)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "Morgan's Hope AI Services",
        "endpoints": {
            "health": "/health",
            "ct": "/predict",
            "gate": "/predict",
            "xray": "/predict/xray",
            "nodule": "/detect",
        },
    }


@app.get("/health")
async def health():
    ct = ct_health()
    gate = gate_health()
    xray = xray_health()
    nodule = nodule_health()
    return {
        "status": "ok",
        "service": "Morgan's Hope AI Services",
        "ct": ct,
        "gate": gate,
        "xray": xray,
        "nodule": nodule,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    return await ct_predict(file)


@app.post("/predict/xray")
async def predict_xray_route(file: UploadFile = File(...)):
    return await predict_xray(file)


@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    return await nodule_detect(file)
