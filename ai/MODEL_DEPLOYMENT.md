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
   - If the CT result is anything other than `Normal`, the backend calls the nodule detector.

3. CT nodule detector (`nodule-service`, port `8003`)
   - Detects suspicious nodules and returns bounding box, size estimate, and confidence.
   - Current local model:
     `G:/MODELS/nodule detector stage 2/nodejs/model/nodule_detector.pt`
   - Runtime defaults from model metadata:
     `NODULE_CONF_THRESHOLD=0.25`, `NODULE_IOU_THRESHOLD=0.45`, `NODULE_PIXEL_SPACING_MM=0.625`

4. Chest X-Ray service (`xray-service`, port `8001`)
   - The old CXR binary model is removed from the product direction.
   - The current main CXR model is the deployed NIH ChestX-ray14 7-class multi-label classifier.
   - Current TB Stage 1 classifier:
     `G:/MODELS/Tb models pipline/stage1/densenet121_tb_torchscript.pt`
   - Current TB Stage 2 localizer:
     `G:/MODELS/Tb models pipline/stage2/yolov8m_tb_best.pt`
   - Current NIH14 7-class TorchScript model:
     `G:/MODELS/Nih14-7classes/models/convnext_tiny_7class_torchscript.pt`
   - Current NIH14 7-class config:
     `G:/MODELS/Nih14-7classes/models/config_7class.json`

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

## Current NIH14 X-Ray Outputs

The NIH14 7-class model currently returns these labels:

- Pulmonary Infection
- COPD-related Findings
- Fibrotic Lung Disease
- Cardiac Conditions
- Potential Malignancy Findings
- Pleural Diseases
- No Finding

## Production Deployment Notes

- Do not upload model binaries to GitHub.
- Use platform-supported persistent storage, object storage download, or private Hugging Face model repos.
- Set the same model paths inside the deployment container:
  - `GATE_MODEL_PATH=/home/user/app/model.pt`
  - `XRAY_MODEL_PATH=/home/user/app/xray_model.pt`
  - `XRAY_CONFIG_PATH=/home/user/app/xray_config_7class.json`
  - `TB_MODEL_PATH=/home/user/app/tb_model.pt`
  - `TB_LOCALIZER_MODEL_PATH=/home/user/app/tb_localizer.pt`
  - `NODULE_MODEL_PATH=/home/user/app/model.pt`
- The current deployed combined Space is:
  `https://abooz65-morgans-hope-ai-services.hf.space`
