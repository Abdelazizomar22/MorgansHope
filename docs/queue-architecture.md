# Message Queue Architecture — BullMQ + Redis

## Overview

Two BullMQ queues decouple slow AI processing from the HTTP request-response cycle,
giving the frontend an immediate response and processing work in the background.

```
  ┌──────────────┐          ┌──────────┐          ┌───────────────┐
  │  Express      │  add()   │  Redis   │  pop()   │  Worker       │
  │  Server       │─────────►│  Queue   │─────────►│  (separate    │
  │  (routes)     │          │  (BullMQ)│          │   process)    │
  └──────────────┘          └──────────┘          └───────┬───────┘
       │                                                   │
       │  Returns { id } immediately                       │ Calls AI service
       ▼                                                   ▼
  Frontend polls                                     Python microservice
  GET /:id every 3s                                  or LLM API
```

## Two Queues

| Queue | Queue Name | Job Data | Concurrency | Retries | Backoff | AI Service Called |
|---|---|---|---|---|---|---|
| **Analysis** | `analysis` | `{ analysisId }` | 3 (configurable) | 3 | expo: 5s → 10s → 20s | CT/X-ray Python microservice |
| **Chat** | `chat` | `{ userMessageId, userId }` | 5 (configurable) | 2 | expo: 2s → 5s | Groq → OpenRouter → Gemini fallback |

## File Map

```
src/
├── config/
│   └── redis.ts              ← Redis connection singleton (lazy, ioredis)
├── queues/
│   ├── analysis.queue.ts      ← Queue definition, typed job data, default options
│   └── chat.queue.ts          ← Queue definition, typed job data, default options
├── workers/
│   ├── analysis.worker.ts     ← Worker: reads image from disk, calls microservice, updates DB
│   └── chat.worker.ts         ← Worker: reads message+history from DB, calls LLM, stores reply
├── worker.ts                  ← Entry point: connects DB+Redis, starts both workers, graceful shutdown
├── controllers/
│   └── analysisController.ts  ← Enqueues job instead of calling AI directly
├── routes/
│   └── chat.ts                ← Enqueues job instead of calling LLM directly
└── server.ts                  ← Unchanged (worker runs separately)
```

## Flow Details

### Analysis Flow

```
POST /api/analysis/upload
  │
  ├── 1. Validate file + imageType
  ├── 2. Create AnalysisResult (status: 'pending')
  ├── 3. queue.add('analyse', { analysisId })  ────►  Redis
  ├── 4. Return 202 { analysisId, status: 'pending' }
  │
  ▼  (separate process: npm run worker)
  Worker picks up job
  │
  ├── 5. Load AnalysisResult from DB
  ├── 6. Read image file from disk (uploads/)
  ├── 7. POST /predict to Python microservice (CT or XRAY)
  ├── 8. Map response fields to AnalysisResult columns
  ├── 9. Update DB: status='completed', classification, confidence, etc.
  │
  ▼  (frontend polling)
  GET /api/analysis/:id  →  status: 'completed'
```

### Chat Flow

```
POST /api/chat/
  │
  ├── 1. Validate message + history
  ├── 2. Store user message in DB (visible immediately in history)
  ├── 3. queue.add('reply', { userMessageId, userId })  ────►  Redis
  ├── 4. Return { messageId, status: 'processing' }
  │
  ▼  (separate process: npm run worker)
  Worker picks up job
  │
  ├── 5. Load User + userMessage from DB
  ├── 6. Build history from ChatMessage table (exclude current message)
  ├── 7. Load latest completed analysis
  ├── 8. Call generateChatReply() → Groq → OpenRouter → Gemini → heuristic
  ├── 9. Store assistant reply in DB
  ├── 10. Trim old messages (keep last 30)
  │
  ▼  (frontend polling)
  GET /api/chat/history  →  new assistant message appears
```

## Fallback: Synchronous Processing

If Redis is unreachable (queue unavailable), each route falls back to **synchronous processing** — the old behavior where the HTTP request waits for the AI response. This ensures the app works even without Redis running.

```
Controller/routes tries to queue.add()
  ├── Success → respond immediately with { id, status: 'pending' }
  └── Throw  → log warning, process synchronously, respond when AI finishes
```

The sync fallback calls the same AI logic inline. In dev you can run without Redis; in production Redis must be available for the async path.

## Running & Deployment

### Local Development

```bash
# Terminal 1: Start Redis (Docker recommended)
docker run -p 6379:6379 redis:7-alpine

# Terminal 2: Start Express server
npm run dev

# Terminal 3: Start worker
npm run worker
```

### Production (Vercel / Railway / Render)

The worker runs as a **separate deployment** (separate service/container/process).

| Service | Entry Point | Notes |
|---|---|---|
| Web server | `npm start` | Existing Express app, no changes |
| Worker | `npm run worker` | New, connects to same DB + Redis |

Both services share the same codebase, database, and filesystem (or shared storage for uploads).

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `ANALYSIS_QUEUE_CONCURRENCY` | `3` | Max analysis jobs processed simultaneously per worker |
| `CHAT_QUEUE_CONCURRENCY` | `5` | Max chat jobs processed simultaneously per worker |

## BullMQ Configuration

### Analysis Queue

- **Attempts**: 3 (retry 2 times after initial failure)
- **Backoff**: exponential, starting 5s delay
- **Cleanup**: completed jobs removed after 1 hour, failed after 24 hours
- **Concurrency**: 3 jobs at a time per worker instance

### Chat Queue

- **Attempts**: 2 (retry 1 time)
- **Backoff**: exponential, starting 2s delay
- **Cleanup**: completed jobs removed after 1 hour, failed after 24 hours
- **Concurrency**: 5 jobs at a time per worker instance

## Graceful Shutdown

The worker handles `SIGTERM` and `SIGINT`:
1. Stop accepting new jobs
2. Wait for running jobs (up to a timeout)
3. Close Redis connection
4. Close DB connection
5. Exit

## Observability

- Workers log job completion and failure to stdout
- BullMQ uses Redis for job state — you can inspect queue length, active jobs, failed jobs via BullMQ dashboard or Redis CLI
- All errors are caught and logged with job context (analysisId / messageId)
