# Morgan's Hope AI Services

Morgan's Hope runs the AI pipeline as HTTP services. The Node.js backend can call one combined Hugging Face Space or separate service URLs through environment variables.

## Services

| Service | Folder | Port | Endpoint | Purpose |
| --- | --- | --- | --- | --- |
| CT classifier | `ct_service` | `8000` | `POST /predict` | Existing EfficientNet-B3 CT cancer classifier kept unchanged |
| CXR classifier | `xray_service` | `8001` | `POST /predict/xray` | 7-class Chest X-Ray clinical groups classifier plus TB decision layer and optional TB localization |
| Pre-classification gate | `gate_service` | `8002` | `POST /predict` | EfficientNet-B0 routing: Chest X-Ray, Chest CT, Other Medical, Non Medical |
| CT nodule detector | `nodule_service` | `8003` | `POST /detect` | YOLO nodule localization after positive CT classifier output |

## Local Run

From the `ai` folder:

```bash
docker compose up --build
```

Then configure the backend:

```env
AI_SERVICES_URL=https://abooz65-morgans-hope-ai-services.hf.space
# Optional overrides if you split services again later:
CT_SERVICE_URL=
XRAY_SERVICE_URL=
GATE_SERVICE_URL=
NODULE_SERVICE_URL=
```

## Recommended Deployment Shape

For a free Hugging Face CPU-basic plan, the safest setup is one combined Docker Space that serves all model endpoints internally.

If you do split services later, point the backend to the individual URLs again.
