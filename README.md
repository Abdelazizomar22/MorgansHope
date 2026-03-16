# Morgan's Hope — Lung Cancer AI Detection

> Graduation Project 2025/2026 · Higher Institute of Computer Science & Information Systems

AI-powered lung cancer detection from chest X-rays and CT scans (99%+ accuracy). Full-stack application ready for local development and GitHub deployment.

---

## Repository structure

```
MorgansHope/
├── frontend/          # React 18 + Vite + TypeScript (port 3001)
├── backend/           # Node.js + Express + MySQL API (port 3000)
├── ai/                # Python FastAPI AI services
│   ├── ct_service/    # CT scan classification (port 8000)
│   └── xray_service/  # X-Ray classification (port 8001)
├── README.md          # This file
├── SPEC.md            # API & product specification
├── CODEBASE.md        # Architecture & patterns
├── DEPLOYMENT.md      # Deployment guide (Arabic)
├── CHANGELOG.md       # Version history
├── start-local.ps1    # Start all services (Windows)
├── stop-local.ps1     # Stop all services
└── test-api.ps1      # API test suite
```

- **frontend** — Web UI (login, upload, results, hospitals, chatbot).
- **backend** — REST API, auth, database, proxy to AI services.
- **ai** — Two ML services: CT (6-class) and X-Ray (binary). No UI; called by backend only.

---

## Quick start (local)

**Prerequisites:** Node.js 18+, npm, Python 3.x, MySQL.

From the **project root** (this folder):

```powershell
.\start-local.ps1
```

- Starts backend, frontend, and both AI services (optional: use `-SkipAI` to skip AI).
- Runs DB migrations and seed. Use `-ResetDB` to reset the database.
- Opens http://localhost:3001 when ready.

**Other commands:**

| Command | Description |
|--------|-------------|
| `.\stop-local.ps1` | Stop all services |
| `.\test-api.ps1` | Run API tests |

**Default admin:** `admin@medtech.com` / `Admin@123456` (change in production).

---

## API overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | — | System health (backend + AI status) |
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login (JWT + refresh cookie) |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/auth/logout` | — | Logout |
| GET | `/api/auth/me` | JWT | Current user |
| PUT | `/api/auth/profile` | JWT | Update profile / password |
| POST | `/api/analysis/upload` | JWT | Upload scan (X-Ray or CT) |
| GET | `/api/analysis/history` | JWT | Analysis history |
| GET | `/api/analysis/:id` | JWT | Single result |
| DELETE | `/api/analysis/:id` | JWT | Delete result |
| GET | `/api/hospitals` | JWT | Hospitals (filter by city, etc.) |
| GET | `/api/hospitals/cities` | JWT | Cities list |

Full contract: [SPEC.md](./SPEC.md).

---

## AI models

| Service | Model | Task | Accuracy |
|---------|--------|------|----------|
| X-Ray | EfficientNetB0 | No Finding / Nodule+Mass | 100% |
| CT | EfficientNetB3 | 6-class cancer | 99.86% |

HuggingFace: [Abooz65/medtech-ct-model](https://huggingface.co/Abooz65/medtech-ct-model) · [Abooz65/medtech-xray-model](https://huggingface.co/Abooz65/medtech-xray-model)

---

## Deployment (GitHub & hosting)

- **Repo root:** Use this folder as the GitHub repository root. All paths in docs and scripts refer to `frontend/`, `backend/`, and `ai/` from here.
- **Deploy:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for Netlify (frontend), Render (backend + AI), and MySQL setup.
- **Team:** Each of `frontend/`, `backend/`, and `ai/` has its own README with setup and run instructions.

---

## Authentication

- **Access token:** Short-lived JWT in `Authorization` header (15 min).
- **Refresh token:** HttpOnly cookie (7 days); frontend refreshes automatically on 401.
- **Guards:** AuthGuard (protected routes), GuestGuard (login/register), AdminGuard (admin-only).

---

## Disclaimer

This system is a **diagnostic support tool only** and does not replace a physician's judgment. All results must be reviewed by a qualified medical professional.
