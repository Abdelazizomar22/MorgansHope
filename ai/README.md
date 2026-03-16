# AI Services — Morgan's Hope

Two FastAPI services for medical image classification. No UI; called by the **backend** only.

| Service       | Folder         | Port | Task                          |
|---------------|----------------|------|-------------------------------|
| CT Scan       | `ct_service/`  | 8000 | 6-class CT classification     |
| X-Ray         | `xray_service/`| 8001 | Binary: No Finding / Nodule+Mass |

## Common setup (per service)

```bash
cd ct_service   # or xray_service
pip install -r requirements.txt
```

Optional: set `CT_MODEL_PATH` / `XRAY_MODEL_PATH` to a local `.pt` file. Otherwise the service uses `model.pt` in the same folder or downloads from HuggingFace.

## Run

**CT (port 8000):**

```bash
cd ct_service
uvicorn main:app --host 0.0.0.0 --port 8000
```

**X-Ray (port 8001):**

```bash
cd xray_service
uvicorn main:app --host 0.0.0.0 --port 8001
```

Health: `GET /health` on each service.

## Backend integration

Backend uses `CT_SERVICE_URL` and `XRAY_SERVICE_URL` (e.g. `http://localhost:8000`, `http://localhost:8001`). Upload flow: Frontend → Backend → AI service; result returned via Backend.
