# Backend - Morgan's Hope API

Node.js + Express + TypeScript + Sequelize. Runs on port `3000`.

## Setup

1. Copy `.env.example` to `.env`
2. Set the values you need:
   - `USE_SQLITE=1` for local SQLite development
   - or external DB credentials if you do not want SQLite
   - `CT_SERVICE_URL`
   - `XRAY_SERVICE_URL`
   - `GEMINI_API_KEY`
   - `FRONTEND_URL` for production CORS

Install dependencies and prepare the database:

```bash
npm install
npm run migrate
npm run seed
```

## Run

```bash
npm run dev
```

Notes:
- `npm run dev` uses `ts-node` for better compatibility on this Windows setup.
- `npm run dev:watch` keeps the older watcher-based flow.

API: `http://localhost:3000`
Health: `http://localhost:3000/api/health`

## Build

```bash
npm run build
npm run start
```

## Structure

- `src/server.ts` - Express app and route setup
- `src/config/database.ts` - Sequelize config
- `src/models/` - User, AnalysisResult, Hospital, City, ChatMessage
- `src/controllers/` - auth, analysis, hospital
- `src/routes/` - auth, analysis, hospitals, chat
- `src/middleware/` - auth, upload
- `src/utils/` - migrate, seed, asyncHandler, chatAgent

Uploads are stored in `uploads/`. Chat memory is stored in the `chat_messages` table.
