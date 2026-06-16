# Morgan's Hope AI Model Deployment

This folder contains the deployment entry points for the Morgan's Hope AI pipeline.
Model weights are intentionally not committed to Git because they are large binaries.

## Current Pipeline

1. Pre-classification gate (`gate-service`, port `8002`)
   - Validates whether the upload is a chest CT, chest X-Ray, other medical image, or non-medical image.
   - Current local model:
     `G:/MODELS/validate model/validation_model_torchscript.pt`
   - Class order used by the service:
     `Chest_CT`, `Chest_XRay`, `Non_Medical`, `Other_Medical`

2. CT cancer classifier (`ct-service`, port `8000`)
   - Existing CT model remains unchanged.
   - If the CT result is not `Normal` or `Benign`, the backend calls the nodule detector.

3. CT nodule detector (`nodule-service`, port `8003`)
   - Detects suspicious nodules and returns bounding box, size estimate, and confidence.
   - Current local model:
     `G:/MODELS/nodule detector stage 2/nodejs/model/nodule_detector.pt`
   - Runtime defaults from model metadata:
     `NODULE_CONF_THRESHOLD=0.25`, `NODULE_IOU_THRESHOLD=0.45`, `NODULE_PIXEL_SPACING_MM=0.625`

4. Chest X-Ray service (`xray-service`, port `8001`)
   - The old CXR binary model is removed from the product direction.
   - The future main CXR model is the NIH14 clinical-groups classifier.
   - Until that file is added, the service supports a TB-only fallback so uploads do not break.
   - Current TB Stage 1 classifier:
     `G:/MODELS/Tb models pipline/stage1/densenet121_tb_torchscript.pt`
   - Current TB Stage 2 localizer:
     `G:/MODELS/Tb models pipline/stage2/yolov8m_tb_best.pt`

## Local Docker Run With External Models

Copy the example env file:

```bash
cp ai/.env.models.example ai/.env.models
```

On Windows, keep model paths in Docker-friendly format:

```env
GATE_MODEL_FILE=G:/MODELS/validate model/validation_model_torchscript.pt
NODULE_MODEL_FILE=G:/MODELS/nodule detector stage 2/nodejs/model/nodule_detector.pt
TB_STAGE1_MODEL_FILE=G:/MODELS/Tb models pipline/stage1/densenet121_tb_torchscript.pt
TB_STAGE2_MODEL_FILE=G:/MODELS/Tb models pipline/stage2/yolov8m_tb_best.pt
```

Run the services:

```bash
cd ai
docker compose --env-file .env.models -f docker-compose.yml -f docker-compose.models.example.yml up --build
```

Expected local service URLs:

```env
CT_SERVICE_URL=http://localhost:8000
XRAY_SERVICE_URL=http://localhost:8001
GATE_SERVICE_URL=http://localhost:8002
NODULE_SERVICE_URL=http://localhost:8003
```

## Adding the NIH14 Clinical-Groups X-Ray Model Later

When the NIH14 groups model is available:

1. Add the file outside Git, for example:
   `G:/MODELS/xray nih14 groups/model.pt`
2. Add this mount to `ai/docker-compose.models.example.yml` under `xray-service.volumes`:

```yaml
- "${XRAY_MODEL_FILE}:/home/user/app/model.pt:ro"
```

3. Add this env var to `ai/.env.models`:

```env
XRAY_MODEL_FILE=G:/MODELS/xray nih14 groups/model.pt
ALLOW_TB_ONLY_FALLBACK=false
```

4. Restart the X-Ray service.

The service expects the NIH14 model to return exactly these six groups:

- Pulmonary Infection
- COPD-related Findings
- Fibrotic Lung Disease
- Cardiac Conditions
- Potential Malignancy Findings
- Pleural Diseases

## Production Deployment Notes

- Do not upload model binaries to GitHub.
- Use platform-supported persistent storage, object storage download, or private Hugging Face model repos.
- Set the same model paths inside the deployment container:
  - `GATE_MODEL_PATH=/home/user/app/model.pt`
  - `NODULE_MODEL_PATH=/home/user/app/model.pt`
  - `TB_MODEL_PATH=/home/user/app/tb_model.pt`
  - `TB_LOCALIZER_MODEL_PATH=/home/user/app/tb_localizer.pt`
- Keep `ALLOW_TB_ONLY_FALLBACK=true` only while the NIH14 model is missing.
