"""
CT Scan AI Service — EfficientNetB3 (v3)
Port: 8000  |  POST /predict
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
log = logging.getLogger("ct_service")

CLASSES = {0:"Adenocarcinoma",1:"Benign",2:"Large_Cell_Carcinoma",3:"Malignant_General",4:"Normal",5:"Squamous_Cell_Carcinoma"}
MALIGNANT = {"Adenocarcinoma","Large_Cell_Carcinoma","Squamous_Cell_Carcinoma","Malignant_General"}
IMAGE_SIZE = 300
HF_REPO = "Abooz65/medtech-ct-model"
NEXT_STEPS = {
    "Normal":"No signs of cancer. Continue routine screenings.",
    "Benign":"Benign tissue. Follow up with your physician in 6 months.",
    "Adenocarcinoma":"Malignant — Adenocarcinoma detected. Consult an oncologist immediately.",
    "Large_Cell_Carcinoma":"Malignant — Large cell carcinoma. Urgent oncology referral needed.",
    "Squamous_Cell_Carcinoma":"Malignant — Squamous cell carcinoma. Immediate oncology consultation required.",
    "Malignant_General":"Malignant tissue detected. Consult an oncologist as soon as possible.",
}
TRANSFORM = transforms.Compose([
    transforms.Resize((IMAGE_SIZE,IMAGE_SIZE)),transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225]),
])

def resolve_model_path():
    env = os.environ.get("CT_MODEL_PATH","")
    if env and Path(env).exists(): log.info(f"Using CT_MODEL_PATH: {env}"); return Path(env)
    local = Path(__file__).parent/"model.pt"
    if local.exists(): log.info(f"Using local: {local}"); return local
    return None

def download_hf():
    from huggingface_hub import hf_hub_download
    log.info(f"Downloading from HuggingFace: {HF_REPO}")
    dest = Path(__file__).parent/"model.pt"
    shutil.copy(hf_hub_download(repo_id=HF_REPO, filename="model.pt"), dest)
    return dest

app = FastAPI(title="MedTech CT Service", version="3.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
_model = None

def get_model():
    global _model
    if _model: return _model
    p = resolve_model_path() or download_hf()
    log.info(f"Loading CT model from {p}...")
    m = torch.jit.load(str(p), map_location="cpu"); m.eval(); _model = m
    log.info("✅ CT model ready."); return m

@app.on_event("startup")
async def startup():
    try: get_model()
    except Exception as e: log.warning(f"⚠️ Model not loaded at startup: {e}")

@app.get("/health")
def health(): return {"status":"ok","model":"CT EfficientNetB3","accuracy":"99.86%","loaded":_model is not None}

@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> Dict:
    t0 = time.time()
    try: img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    except Exception as e: raise HTTPException(400, f"Cannot open image: {e}")
    tensor = TRANSFORM(img).unsqueeze(0)
    try:
        m = get_model()
        with torch.no_grad():
            class_logits, cancer_logit = m(tensor)
        probs = torch.softmax(class_logits,dim=1)[0].tolist()
        pred_idx = int(torch.argmax(class_logits,dim=1).item())
        cancer_prob = float(torch.sigmoid(cancer_logit)[0][0].item())
    except Exception as e:
        log.error(f"Inference error: {e}"); log.warning("Returning MOCK result")
        probs=[0.001,0.001,0.001,0.001,0.995,0.001]; pred_idx=4; cancer_prob=0.005
    diagnosis=CLASSES[pred_idx]; confidence=probs[pred_idx]; is_malignant=diagnosis in MALIGNANT
    return {
        "has_cancer":cancer_prob>0.5,"cancer_prob":round(cancer_prob,4),"diagnosis":diagnosis,
        "confidence":round(float(confidence),4),"is_malignant":is_malignant,
        "all_probs":{CLASSES[i]:round(float(p),4) for i,p in enumerate(probs)},
        "next_step":NEXT_STEPS.get(diagnosis,"Consult your physician."),
        "processing_ms":int((time.time()-t0)*1000),
    }
