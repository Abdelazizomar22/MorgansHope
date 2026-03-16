# Backend — Morgan's Hope API

Node.js + Express + TypeScript + Sequelize (MySQL). Port **3000**.

## Setup

1. Copy `.env.example` to `.env` and set DB and URLs:

   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `CT_SERVICE_URL` (default http://localhost:8000)
   - `XRAY_SERVICE_URL` (default http://localhost:8001)
   - `FRONTEND_URL` for CORS in production

2. Install and prepare DB:

```bash
npm install
npm run migrate
npm run seed
```

## Run

```bash
npm run dev
```

API: http://localhost:3000. Health: http://localhost:3000/api/health.

## Build (production)

```bash
npm run build
npm run start
```

## Structure

- `src/server.ts` — Express app, middleware, routes
- `src/config/database.ts` — Sequelize config
- `src/models/` — User, AnalysisResult, Hospital, City
- `src/controllers/` — auth, analysis, hospital
- `src/routes/` — auth, analysis, hospitals
- `src/middleware/` — auth, upload
- `src/utils/` — migrate, seed, asyncHandler

Uploads are stored in `uploads/` (created automatically). AI calls go to CT and X-Ray services via `CT_SERVICE_URL` and `XRAY_SERVICE_URL`.
