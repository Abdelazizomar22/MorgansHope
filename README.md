# Morgan's Hope - Lung Cancer AI Detection

> Graduation Project 2025/2026 - Higher Institute of Computer Science & Information Systems

AI-powered lung cancer detection from chest X-rays and CT scans. Full-stack application for local development and deployment.

---

## Repository Structure

```text
MorgansHope/
|-- frontend/          React 18 + Vite + TypeScript (port 3001)
|-- backend/           Node.js + Express + Sequelize API (port 3000)
|-- ai/                Python FastAPI AI services
|   |-- ct_service/    CT scan classification (port 8000)
|   `-- xray_service/  X-ray classification (port 8001)
|-- README.md
|-- start-local.ps1
`-- stop-local.ps1
```

- `frontend` - Web UI for auth, upload, results, profile, hospitals, and chatbot.
- `backend` - REST API, auth, chat agent, database, and AI-service integration.
- `ai` - CT and X-ray ML services.

---

## Quick Start

Prerequisites: Node.js 18+, npm, Python 3.x. Local development uses SQLite by default.

From the project root:

```powershell
.\start-local.ps1
```

This starts:
- frontend on `http://localhost:3001`
- backend on `http://localhost:3000`
- optional AI services unless `-SkipAI` is used

Useful commands:

| Command | Description |
|---|---|
| `.\start-local.ps1 -SkipAI` | Start frontend and backend only |
| `.\stop-local.ps1` | Stop local services |

Default admin:
- Email: `admin@medtech.com`
- Password: `Admin@123456`

---

## Notes

- Backend chat now uses `GEMINI_API_KEY` from `backend/.env`, not the frontend.
- Chat memory is persisted in the backend database.
- Generated runtime files and logs should not be committed.
- Main project docs live in this file plus the service-specific READMEs in `frontend/` and `backend/`.

---

## Pre-Launch QA (Required)

Run this quick checklist before production deployment:

- Authentication
  - Email/password login works with valid and invalid credentials.
  - `Keep me signed in` tested both checked and unchecked.
  - Google login tested for:
    - new user creation,
    - existing user login,
    - cancel/deny flow from Google,
    - account without a usable photo (fallback initial must appear).

- Registration safety
  - Registration fails with a clear message when medical disclaimer is not accepted.
  - Registration succeeds only after disclaimer acceptance.

- Contact flow
  - Contact form submission succeeds in UI.
  - Inbox email includes sender name, sender email, phone, message, and submitted time.

- Chatbot behavior
  - General greeting (for example: "Hi" / "ازيك") gets a normal conversational reply.
  - Medical questions still trigger triage-aware guidance.
  - Commands like "explain my latest result" and "suggest next step" return focused responses.

- Production configuration
  - Production OAuth callback/origin values are set in Google Cloud Console.
  - Production `FRONTEND_URL`, `VITE_API_URL`, and backend env values are set correctly.
  - All exposed/previously shared keys are rotated before launch.

---

## Disclaimer

This system is a diagnostic support tool only and does not replace a physician's judgment. All results should be reviewed by a qualified medical professional.
