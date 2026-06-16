# Morgan's Hope

Morgan's Hope is an AI-assisted medical screening platform for chest imaging. It helps users upload chest CT scans or chest X-ray images, receive structured AI-supported screening results, review their history, understand recommended next steps, and find oncology/chest-care hospitals in Egypt.

The platform is built as a graduation project and is designed for clinical decision support and education. It is not a replacement for a qualified physician, radiologist, oncologist, or an official medical diagnosis.

## Current Screening Scope

Morgan's Hope currently supports two chest imaging paths:

### Chest CT Scan

The existing CT model remains unchanged. It uses an EfficientNet-B3-based classifier for lung cancer screening with six CT classes:

- Normal
- Benign
- Adenocarcinoma
- Large Cell Carcinoma
- Squamous Cell Carcinoma
- Malignant General

For suspicious CT results, the platform is prepared to call a CT nodule detection service that can return bounding-box information, estimated nodule size, and detection confidence when the detector is deployed.

### Chest X-Ray

The old binary CXR model has been removed from the project direction. The CXR pipeline is now prepared around clinical chest-disease groups instead of a simple Normal / Nodule-Mass output.

The current CXR clinical groups are:

- Pulmonary Infection
- COPD-related Findings
- Fibrotic Lung Disease
- Cardiac Conditions
- Potential Malignancy Findings
- Pleural Diseases

The CXR service is also prepared for an optional TB signal, allowing a dedicated tuberculosis classifier to run alongside the multi-disease CXR classifier when the model artifact is available.

## AI Pipeline

The backend coordinates the scan workflow through separate AI services:

- Pre-classification gate: checks whether the uploaded image is a chest X-ray, chest CT, other medical image, or non-medical image.
- CT classifier: keeps the original CT cancer model behavior.
- CXR classifier: uses the new clinical-group CXR pipeline.
- CT nodule detector: optional follow-up service for suspicious CT results.

This service-based design keeps the frontend stable while allowing each model to be deployed, replaced, or scaled independently.

## Repository Structure

```text
MorgansHope/
├── ai/
├── backend/
├── frontend/
└── README.md
```

- `frontend/` contains the user-facing web application.
- `backend/` contains the API, authentication, chat orchestration, analysis workflow, and data layer.
- `ai/` contains the FastAPI model services for CT, CXR, gate classification, and nodule detection.

## Core Features

- Email/password and Google authentication
- Chest CT and chest X-ray upload flow
- AI-assisted scan analysis with structured result storage
- Result history and report-oriented result pages
- Hospital directory and follow-up guidance for Egypt
- Smart medical assistant for explanations, summaries, next steps, and safety guidance
- Batch-friendly upload experience

## Medical Disclaimer

Morgan's Hope provides AI-assisted screening support only. Results are informational and research-oriented, not a final diagnosis. Users must consult a qualified physician, radiologist, pulmonologist, or oncologist before making medical decisions.

## Contributing to Morgan's Hope

1. Fork or clone the repository.
2. Create a dedicated branch for your task.
3. Keep each change focused and clearly documented.
4. Open a Pull Request with a concise description of the work.
5. Wait for review before merging into `main`.

## Contribution Guidelines

- Do not push directly to `main`.
- Do not use force push on shared branches.
- Keep changes limited to the area you are working on.
- Use clear commit messages.
- Avoid exposing secrets, private environment values, or internal deployment details.
- Make sure the code you submit is reviewed and production-appropriate.

## Questions

For questions about the project, please reach out to **Abdelaziz**.
