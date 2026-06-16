# Deployment Guide

## Local Development — Docker Compose

One command starts the entire stack:

```bash
docker compose up --build
```

This brings up:

| Service | Internal Name | Host Port | Tech |
|---|---|---|---|
| Redis | `redis` | 6379 | redis:7-alpine |
| CT AI Model | `ct-service` | 8000 | FastAPI (EfficientNetB3) |
| X-Ray AI Model | `xray-service` | 8001 | FastAPI (EfficientNetB0) |
| Express Backend | `backend` | 3000 | Node.js + ts-node-dev |
| BullMQ Worker | `worker` | — | Node.js + ts-node-dev |
| React Frontend | `frontend` | 3001 | Vite dev server |

**Source code is mounted as volumes** — edit files on your host and the services
restart automatically (backend/worker use `ts-node-dev --respawn`, frontend uses Vite HMR).

**AI models** are downloaded from HuggingFace on first startup (≈5 minutes for the CT model,
≈1 minute for X-Ray). The model weights are cached in named volumes so subsequent starts
are instant.

### First-time startup

```bash
# Build and start everything
docker compose up --build

# Or start specific services
docker compose up --build backend worker redis

# View logs
docker compose logs -f backend worker

# Stop everything
docker compose down
```

### Environment variables

Edit `docker-compose.yml` or create a `.env` file in the project root with overrides:

```bash
# .env (auto-loaded by docker compose)
JWT_SECRET=your_production_secret_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
GMAIL_USER=morganshope40@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

The compose file already sets sensible defaults for development.

---

## Production Deployment

### Architecture

```
                         ┌─────────────────┐
                         │   Load Balancer  │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌───────▼───────┐           ┌───────▼───────┐
            │   Frontend     │           │   Backend     │
            │  (Vercel /     │           │  (Docker /    │
            │   CDN / Nginx) │           │   VM)         │
            └───────┬───────┘           └───────┬───────┘
                    │                           │
                    │                   ┌───────▼───────┐
                    │                   │   Worker      │
                    │                   │  (Docker /    │
                    │                   │   VM)         │
                    │                   └───────┬───────┘
                    │                           │
                    └──────────┬────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │      Redis          │
                    │  (Upstash / Redis   │
                    │   Cloud / self-host)│
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Database         │
                    │  (PostgreSQL /      │
                    │   RDS / Neon)       │
                    └─────────────────────┘
```

### Worker Deployment

The worker is the **same Docker image** as the backend, just with a different command.
It can run on:
- A separate container in the same pod/VM
- A separate VM/instance
- A separate serverless container (Railway, Render, Fly.io)

#### Docker (single machine)

```bash
# Backend container
docker run -d --name mh-backend \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e REDIS_URL=redis://<redis-host>:6379 \
  -e DATABASE_URL=postgres://... \
  morgans-hope-backend \
  node dist/server.js

# Worker container (same image, different CMD)
docker run -d --name mh-worker \
  -e NODE_ENV=production \
  -e REDIS_URL=redis://<redis-host>:6379 \
  -e DATABASE_URL=postgres://... \
  morgans-hope-backend \
  node dist/worker.js
```

#### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mh-backend
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: backend
          image: morgans-hope-backend
          command: ["node", "dist/server.js"]
          env:
            - name: REDIS_URL
              value: redis://redis-service:6379
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mh-worker
spec:
  replicas: 1
  template:
    spec:
      containers:
        - name: worker
          image: morgans-hope-backend
          command: ["node", "dist/worker.js"]
          env:
            - name: REDIS_URL
              value: redis://redis-service:6379
```

#### Railway / Render / Fly.io

| Service | Build Command | Start Command |
|---|---|---|
| Backend | `cd backend && npm install && npm run build` | `node dist/server.js` |
| Worker | `cd backend && npm install && npm run build` | `node dist/worker.js` |

Both services use the same codebase. Add a `REDIS_URL` environment variable pointing to
your Redis instance.

**Important**: For production, use PostgreSQL (not SQLite). Set `USE_SQLITE=0` and configure
`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

---

## File Storage

The worker needs access to the same uploaded images as the backend. In production:

- **Single machine**: mount the same `uploads/` directory for both containers
- **Multiple machines**: use shared storage (S3, GCS, NFS)

For S3 support, update the upload middleware and worker to use cloud storage instead of
local disk. This is a planned future improvement.

---

## Worker Scaling

- **Concurrency**: controlled by `ANALYSIS_QUEUE_CONCURRENCY` (default 3) and
  `CHAT_QUEUE_CONCURRENCY` (default 5)
- **Instances**: run multiple worker containers/instances for higher throughput.
  BullMQ distributes jobs across all available workers via Redis
- **Idle workers**: workers with no jobs consume minimal resources — they poll Redis
  with a blocking connection

---

## Monitoring

- **Redis**: BullMQ dashboard at `/queues` (install `bull-board` for a web UI)
- **Worker logs**: stdout — `docker logs -f mh-worker` or `kubectl logs -f deployment/mh-worker`
- **Failed jobs**: BullMQ stores failed jobs with error messages in Redis.
  Inspect with `bull-board` or Redis CLI: `ZRANGE bull:analysis:failed 0 -1`
- **Health**: `GET /api/health` shows backend, database, and AI service status
