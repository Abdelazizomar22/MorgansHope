# Morgan's Hope — Codebase Documentation

Overview of system architecture and technical patterns for developers working on **frontend**, **backend**, or **ai** services. All paths below are relative to the **project root** (repository root).

## 🏗 System Architecture

The application follows a microservices-lite architecture:

| Part | Path | Stack |
|------|------|--------|
| **Frontend** | `frontend/` | React (Vite) + TypeScript, port 3001 |
| **Backend** | `backend/` | Node.js (Express) + TypeScript + Sequelize (MySQL), port 3000 |
| **AI** | `ai/ct_service/`, `ai/xray_service/` | Python (FastAPI), ports 8000, 8001 |

---

## 🔐 Authentication & Security (Professional Standards)

We use a robust JWT-based authentication system with **Refresh Tokens**.

### Token Strategy
- **Access Token**: Short-lived (15 min), sent via `Authorization: Bearer <token>` header.
- **Refresh Token**: Long-lived (7 days), stored in an **HttpOnly, SameSite=Strict** cookie. This prevents XSS from stealing the refresh token.

### Silent Refresh
The Frontend uses an Axios interceptor (`src/utils/api.ts`) that:
1. Detects `401 Unauthorized` errors.
2. Automatically calls `/api/auth/refresh` to get a new access token.
3. Retries the original request seamlessly.
4. If refresh fails (token expired), it triggers a clean logout.

### Route Protection
- `AuthGuard`: Required for pages needing login. Saves the "intended destination" and redirects back after login.
- `GuestGuard`: Prevents logged-in users from seeing `/login` or `/register`.
- `AdminGuard`: Restricts access to specific roles (e.g., `admin`).

---

## 🛠 Backend Patterns

### Centralized Error Handling
No more `try/catch` blocks in every controller. We use the `asyncHandler` utility.
```typescript
export const login = asyncHandler(async (req, res) => {
  // Logic here... if it throws, asyncHandler catches it and sends to global error handler.
});
```

### Request Tracing
Every request gets a unique `X-Request-ID` header, visible in the response. This is crucial for debugging logs in production.

### Performance
Responses are automatically compressed using **Gzip** (`compression` middleware).

---

## ⚛️ Frontend Patterns

### Styling
We use **Vanilla CSS** with a robust CSS Variable system (`src/index.css`) for theming (Light/Dark mode) and RTL support.

### Error Boundaries
The entire app is wrapped in a global `ErrorBoundary` component. If any React component crashes, the user sees a premium "Something went wrong" screen instead of a blank page.

---

## 🤖 AI Integration
- **CT Service**: Listens on port 8000.
- **X-Ray Service**: Listens on port 8001.
- The Backend acts as a proxy/gateway for the AI services, ensuring authentication is checked before processing medical data.

---

## 🚀 Local Development

From the **project root** (same folder as this README):

- `.\start-local.ps1` — Starts DB setup, Backend, Frontend, and AI services.
- `.\stop-local.ps1` — Stops all services.
- `.\test-api.ps1` — Runs the API test suite.

See [README.md](./README.md) and each of `frontend/README.md`, `backend/README.md`, `ai/README.md` for per-service setup.
