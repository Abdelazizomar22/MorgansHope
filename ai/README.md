# Morgan's Hope AI Services

Morgan's Hope runs the AI pipeline as separate HTTP services. The Node.js backend calls these services through environment variables.

## Services

| Service | Folder | Port | Endpoint | Purpose |
| --- | --- | --- | --- | --- |
| CT classifier | `ct_service` | `8000` | `POST /predict` | Existing EfficientNet-B3 CT cancer classifier kept unchanged |
| CXR classifier | `xray_service` | `8001` | `POST /predict/xray` | 7-class Chest X-Ray clinical groups classifier plus TB decision layer and optional TB localization |
| Pre-classification gate | `gate_service` | `8002` | `POST /predict` | EfficientNet-B0 routing: Chest X-Ray, Chest CT, Other Medical, Non Medical |
| CT nodule detector | `nodule_service` | `8003` | `POST /detect` | YOLO nodule localization after positive CT classifier output |

## Required Model Files

Each service expects a TorchScript/YOLO model file inside its own folder unless a remote Hugging Face repo or model path is configured.

| Service | Local file | Optional env |
| --- | --- | --- |
| CT classifier | `ai/ct_service/model.pt` | `CT_MODEL_PATH` |
| CXR classifier | `ai/xray_service/model.pt` | `XRAY_MODEL_PATH`, `XRAY_HF_REPO` |
| TB classifier | `ai/xray_service/tb_model.pt` | `TB_MODEL_PATH`, `TB_HF_REPO` |
| Gate classifier | `ai/gate_service/model.pt` | `GATE_MODEL_PATH`, `GATE_HF_REPO` |
| Nodule detector | `ai/nodule_service/model.pt` | `NODULE_MODEL_PATH` |

## Local Run

From the `ai` folder:

```bash
docker compose up --build
```

Then configure the backend:

```env
CT_SERVICE_URL=http://localhost:8000
XRAY_SERVICE_URL=http://localhost:8001
GATE_SERVICE_URL=http://localhost:8002
NODULE_SERVICE_URL=http://localhost:8003
```

## Backend Behavior

The backend now stores:

- gate classification and confidence
- X-Ray clinical group
- TB detection and confidence when the TB model is available
- CT nodule bounding box, estimated size, and confidence

The CT classifier intentionally keeps the original service behavior. The old binary CXR model is no longer the documented target pipeline; CXR output should now follow the 7-class logic used by `xray_service`, with TB allowed to override when its confidence is stronger than competing X-ray group predictions.

## Deployment Options

Recommended setup for a graduation/demo deployment:

1. Keep the frontend on Vercel.
2. Deploy the Node.js backend as a normal web service.
3. Deploy each AI folder as a separate Docker service.

Good hosting shapes:

- Hugging Face Spaces Docker: best for AI demo endpoints and model hosting experiments. Each service can be deployed as one Docker Space exposing port `7860`.
- Render/Railway/Fly.io: good when you want backend and AI services under one cloud dashboard. Create one web service per AI folder and point the backend env vars to their public URLs.

Do not deploy the PyTorch model services directly inside the frontend app. They are heavier than a normal web frontend and need container-style hosting.
