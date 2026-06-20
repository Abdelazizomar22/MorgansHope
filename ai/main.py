from importlib import import_module
import logging
import os

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("morgans_hope_ai")

app = FastAPI(title="Morgan's Hope AI Services", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def _ct():
    return import_module("ct_service.main")


def _gate():
    return import_module("gate_service.main")


def _xray():
    return import_module("xray_service.main")


def _nodule():
    return import_module("nodule_service.main")


@app.on_event("startup")
async def startup():
    preload = os.environ.get("PRELOAD_AI_MODELS", "false").lower() == "true"
    if not preload:
        log.info("Lazy model loading enabled. Set PRELOAD_AI_MODELS=true to warm models at startup.")
        return

    loaders = [
        ("ct", _ct().get_model),
        ("gate", _gate().get_model),
        ("xray", _xray().get_xray_model),
        ("xray_config", _xray().get_xray_config),
        ("tb", _xray().get_tb_model),
        ("tb_localizer", _xray().get_tb_localizer),
        ("nodule", _nodule().get_model),
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
    return {
        "status": "ok",
        "service": "Morgan's Hope AI Services",
        "ct": _ct().health(),
        "gate": _gate().health(),
        "xray": _xray().health(),
        "nodule": _nodule().health(),
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    return await _ct().predict(file)


@app.post("/predict/xray")
async def predict_xray_route(file: UploadFile = File(...)):
    return await _xray().predict_xray(file)


@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    return await _nodule().detect(file)
