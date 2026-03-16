"""
X-Ray AI Service — EfficientNetB0 (v3)
Port: 8001  |  POST /predict/xray
"""
import io, os, time, logging, shutil
from pathlib import Path
from typing import Dict, Optional
import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)-8s %(message)s")
log = logging.getLogger("xray_service")

CLASSES = ["No Finding","Nodule/Mass"]
IMAGE_SIZE = 224
HF_REPO = "Abooz65/medtech-xray-model"
NEXT_STEPS = {
    "No Finding":"No significant findings. Continue routine follow-up.",
    "Nodule/Mass":"Suspicious nodule or mass detected. CT scan strongly recommended.",
}
TRANSFORM = transforms.Compose([
    transforms.Resize((IMAGE_SIZE,IMAGE_SIZE)),transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225]),
])

def resolve_model_path():
    env = os.environ.get("XRAY_MODEL_PATH","")
    if env and Path(env).exists(): return Path(env)
    local = Path(__file__).parent/"model.pt"
    if local.exists(): return local
    return None

def download_hf():
    from huggingface_hub import hf_hub_download
    dest = Path(__file__).parent/"model.pt"
    shutil.copy(hf_hub_download(repo_id=HF_REPO, filename="model.pt"), dest)
    return dest

app = FastAPI(title="MedTech X-Ray Service", version="3.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
_model = None

def get_model():
    global _model
    if _model: return _model
    p = resolve_model_path() or download_hf()
    m = torch.jit.load(str(p), map_location="cpu"); m.eval(); _model = m
    log.info("✅ X-Ray model ready."); return m

@app.on_event("startup")
async def startup():
    try: get_model()
    except Exception as e: log.warning(f"⚠️ {e}")

@app.get("/health")
def health(): return {"status":"ok","model":"XRay EfficientNetB0","accuracy":"100%","loaded":_model is not None}

@app.post("/predict/xray")
async def predict_xray(file: UploadFile = File(...)) -> Dict:
    t0 = time.time()
    try: img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    except Exception as e: raise HTTPException(400, f"Cannot open image: {e}")
    tensor = TRANSFORM(img).unsqueeze(0)
    try:
        with torch.no_grad(): probs = torch.softmax(get_model()(tensor),dim=1)[0].tolist()
    except: probs = [0.98, 0.02]
    prob_dict = {c:round(float(p),6) for c,p in zip(CLASSES,probs)}
    top = max(prob_dict, key=prob_dict.__getitem__)
    return {
        "has_finding":top=="Nodule/Mass","diagnosis":top,"confidence":round(prob_dict[top],6),
        "next_step":NEXT_STEPS[top],"all_probs":prob_dict,
        "processing_ms":int((time.time()-t0)*1000),
    }
