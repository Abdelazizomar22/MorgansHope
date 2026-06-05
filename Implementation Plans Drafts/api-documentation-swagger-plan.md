# API Documentation — Swagger / OpenAPI Implementation Plan

## Current State

There is **zero** API documentation in the project. No Swagger, no OpenAPI, no Postman collection, no handwritten docs. The only reference for API contracts is the frontend's `src/utils/api.ts` (Axios calls + inline TypeScript types) and the backend route/controller code.

---

## Tool Selection

| Tool | Decorators Needed | Spec Source | Verdict |
|---|---|---|---|
| **swagger-jsdoc + swagger-ui-express** | No (JSDoc comments) | JSDoc in route files | ✅ Best fit |
| tsoa | Yes (`experimentalDecorators`) | Decorated controllers | ❌ Requires tsconfig changes |
| Hand-written OpenAPI YAML | No | Manual `.yaml` file | ❌ Drifts from code |
| Postman collection | No | Manual | ❌ Not auto-generated |

### Chosen: `swagger-jsdoc` + `swagger-ui-express`

**Why:**
- Zero tsconfig changes (no decorators needed)
- Documentation lives as JSDoc comments above route definitions — stays in sync with code
- 2 npm packages, ~30 lines of setup
- Interactive Swagger UI at `/api/docs` — can test every endpoint directly

---

## Complete API Inventory

Below is every endpoint extracted from the routes, ready to document.

### Health

| Method | Path | Auth | Query Params | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/api/health` | No | — | — | `{ success, data: { server, database, ai: { ctService, xrayService }, timestamp } }` |
| GET | `/api` | No | — | — | `{ success, message, data: { endpoints } }` |

### Auth

| Method | Path | Auth | Query Params | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | No | — | `{ firstName, lastName, email, password, confirmPassword, acceptedDisclaimer, age?, gender?, smokingHistory?, medicalHistory? }` | `{ success, data: { user: SafeUser, token } }` |
| POST | `/api/auth/login` | No | — | `{ email/identifier, password, rememberMe? }` | `{ success, data: { user: SafeUser, token } }` + Set-Cookie |
| POST | `/api/auth/logout` | No | — | — | `{ success }` + Clear-Cookie |
| POST | `/api/auth/refresh` | No | — | Cookie: `medtech_refresh` | `{ success, data: { token, user } }` + Set-Cookie |
| GET | `/api/auth/me` | Bearer | — | — | `{ success, data: SafeUser }` |
| PUT | `/api/auth/profile` | Bearer | — | `{ firstName?, lastName?, phone?, age?, gender?, smokingHistory?, medicalHistory?, onboardingCompleted?, currentPassword?, newPassword? }` | `{ success, data: SafeUser }` |
| POST | `/api/auth/verify-contact` | Bearer | — | `{ code }` | `{ success, data: SafeUser }` |
| POST | `/api/auth/send-phone-otp` | Bearer | — | — | `{ success, data: { devCode? } }` |
| POST | `/api/auth/verify-phone-otp` | Bearer | — | `{ otp }` | `{ success, data: SafeUser }` |
| POST | `/api/auth/resend-verification` | Bearer | — | `{ channel?: 'email' \| 'phone' }` | `{ success, data: { channel, smsSent?, to?, devCode? } }` |
| POST | `/api/auth/avatar` | Bearer | — | `multipart/form-data: { avatar: File }` | `{ success, data: SafeUser }` |
| GET | `/api/auth/google` | No | — | — | Redirects to Google |
| GET | `/api/auth/google/callback` | No | `code`, `state` | — | Redirects to frontend with token |

### Analysis

| Method | Path | Auth | Query Params | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/api/analysis/upload` | Bearer | — | `multipart/form-data: { image: File, imageType: 'xray'\|'ct', sessionId? }` | `{ success, data: { result: AnalysisResult, urgencyLevel, recommendedHospitals, processingTimeMs } }` |
| GET | `/api/analysis/history` | Bearer | `page?`, `limit?` | — | `{ success, data: AnalysisResult[], pagination: { page, limit, total, totalPages } }` |
| GET | `/api/analysis/:id` | Bearer | — | — | `{ success, data: AnalysisResult }` |
| DELETE | `/api/analysis/:id` | Bearer | — | — | `{ success }` |

### Hospitals

| Method | Path | Auth | Query Params | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/api/hospitals` | Bearer | `city?`, `type?`, `specialization?`, `search?`, `page?`, `limit?` | — | `{ success, data: Hospital[], pagination }` |
| GET | `/api/hospitals/cities` | Bearer | — | — | `{ success, data: City[] }` |
| GET | `/api/hospitals/:id` | Bearer | — | — | `{ success, data: Hospital }` |

### Chat

| Method | Path | Auth | Query Params | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/api/chat` | Bearer | — | `{ message, history?: Array<{ role, content }> }` | `{ success, data: { reply, usedLatestAnalysis, memoryTurnsUsed } }` |
| GET | `/api/chat/history` | Bearer | — | — | `{ success, data: Array<{ role, content, createdAt }> }` |

### Dev-only (hidden in production)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/auth/debug` | No | DB connection + admin user verification |
| GET | `/api/auth/dev-setup` | No | Creates/resets admin user |

---

## Response Envelope (shared by all endpoints)

```ts
// Success
{ success: true, message: string, data?: T }

// Success with pagination
{ success: true, message: string, data: T[], pagination: { page, limit, total, totalPages } }

// Error
{ success: false, message: string, errors?: Array<{ field: string, message: string }> }
```

### Key Type Schemas

```ts
SafeUser {
  id: number, firstName: string, lastName: string, fullName: string,
  email?: string, phone?: string, emailVerified?: boolean,
  phoneVerified?: boolean, acceptedDisclaimer?: boolean,
  onboardingCompleted?: boolean, authProvider?: 'local' | 'google',
  age?: number, gender?: 'male' | 'female' | 'other',
  smokingHistory?: 'never' | 'former' | 'current',
  medicalHistory?: string, profilePicture?: string,
  role: 'user' | 'admin', isActive: boolean, createdAt: string
}

AnalysisResult {
  id: number, userId: number, imageType: 'xray' | 'ct',
  imagePath: string, originalFilename: string,
  classification: string, confidence: number,
  hasFindings: boolean, hasCancer?: boolean,
  cancerProbability?: number, isMalignant?: boolean,
  allProbabilities: Record<string, number>,
  nextStep?: string, sessionId?: string,
  status: 'pending' | 'completed' | 'failed',
  processingTimeMs?: number, urgencyLevel: UrgencyLevel,
  createdAt: string, updatedAt: string
}

Hospital {
  id: number, cityId: number, hospitalName: string,
  specialization: string, address: string, phone: string,
  website?: string, rating: number, totalReviews: number,
  imageUrl?: string, isActive: boolean, city?: City
}

UploadResponse {
  result: AnalysisResult, urgencyLevel: UrgencyLevel,
  recommendedHospitals: Hospital[], processingTimeMs: number
}
```

---

## Implementation Steps

### Step 1 — Install Dependencies

```bash
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

No tsconfig changes needed (no decorators).

### Step 2 — Create OpenAPI Base Definition

```
backend/src/config/swagger.ts       ← CREATE
```

This file defines:
- OpenAPI version (3.0.0)
- Server URLs (local + production)
- API title, description, version
- Bearer auth security scheme
- Shared response components (ApiResponse, PaginatedResponse)
- Shared schema components (SafeUser, AnalysisResult, Hospital, etc.)

### Step 3 — Add JSDoc Comments to Each Route

One block per endpoint, placed above the route definition in the route files.

**Example pattern:**

```ts
// routes/auth.ts

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, confirmPassword, acceptedDisclaimer]
 *             properties:
 *               firstName: { type: string }
 *               lastName:  { type: string }
 *               email:     { type: string, format: email }
 *               password:  { type: string, minLength: 8 }
 *               confirmPassword: { type: string }
 *               acceptedDisclaimer: { type: boolean }
 *               age:       { type: number }
 *               gender:    { type: string, enum: [male, female, other] }
 *               smokingHistory: { type: string, enum: [never, former, current] }
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/SafeUser' }
 *                         token: { type: string }
 *       409:
 *         description: Email already registered
 *       422:
 *         description: Validation failed
 */
router.post('/register', registerValidators, register);
```

**Files to annotate:**

| File | Endpoints |
|---|---|
| `routes/auth.ts` | All 14 auth endpoints |
| `routes/analysis.ts` | All 4 analysis endpoints |
| `routes/hospitals.ts` | All 3 hospital endpoints |
| `routes/chat.ts` | Both chat endpoints |
| `server.ts` | Health + root endpoints |

### Step 4 — Wire Swagger into Server

In `server.ts`, after the CORS + middleware setup and before the route mounts:

```ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerConfig from './config/swagger';

const swaggerSpec = swaggerJsdoc(swaggerConfig);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Morgan's Hope API Docs",
}));

// Optional: expose raw JSON spec
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));
```

### Step 5 — Protect Docs in Production (Optional)

If you want docs only accessible to authenticated admins:

```ts
if (isDev) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} else {
  app.use('/api/docs', authenticate, requireRole('admin'), swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```

### Step 6 — Define All Shared Components

In `config/swagger.ts`, define reusable `components/schemas`:

- `ApiResponse` — `{ success, message, data? }`
- `PaginatedResponse` — `{ success, message, data[], pagination }`
- `SafeUser`
- `AnalysisResult`  
- `Hospital`
- `City`
- `UploadResponse`
- `ChatTurn` — `{ role: 'user'|'assistant', content: string }`
- `UrgencyLevel` — enum
- `ImageType` — enum
- `ErrorResponse` — `{ success: false, message, errors? }`

### Step 7 — Verify

1. Start backend: `npm run dev` (or `npm run dev:watch`)
2. Open `http://localhost:3000/api/docs`
3. Swagger UI loads with all endpoints grouped by tag
4. Click "Authorize" → paste a Bearer token → test authenticated endpoints
5. View raw spec at `http://localhost:3000/api/docs.json`

---

## Files to Create/Modify

| Action | File | Purpose |
|---|---|---|
| CREATE | `backend/src/config/swagger.ts` | OpenAPI base config + component schemas |
| MODIFY | `backend/src/server.ts` | Wire swagger-jsdoc + swagger-ui-express |
| MODIFY | `backend/src/routes/auth.ts` | JSDoc annotations on all 14 endpoints |
| MODIFY | `backend/src/routes/analysis.ts` | JSDoc annotations on 4 endpoints |
| MODIFY | `backend/src/routes/hospitals.ts` | JSDoc annotations on 3 endpoints |
| MODIFY | `backend/src/routes/chat.ts` | JSDoc annotations on 2 endpoints |

---

## Effort Estimate

| Step | Files | Estimated Time |
|---|---|---|
| Step 1 — Install packages | 0 (CLI only) | 2 min |
| Step 2 — Swagger config | 1 file (~60 lines) | 15 min |
| Step 3 — JSDoc annotations | 4 files (~40 endpoints) | 60-90 min |
| Step 4 — Wire into server | 1 file (~10 lines) | 5 min |
| Step 5 — Auth protection | 1 file (optional, ~5 lines) | 5 min |
| Step 6 — Shared schemas | 1 file (~100 lines) | 20 min |
| Step 7 — Verify | Manual | 10 min |
| **Total** | | **~2 hours** |

---

## Testing after Implementation

1. Open `/api/docs` — Swagger UI renders all endpoints grouped by tag
2. Test `POST /api/auth/register` — enter JSON body → get 201 response
3. Take the token → click "Authorize" → paste `Bearer <token>`
4. Test `GET /api/auth/me` — should return user profile
5. Test `GET /api/analysis/history` — should return paginated results (or empty)
6. Test `POST /api/analysis/upload` — upload a test image, verify the response
7. Test endpoints without auth — verify 401 response
8. Test with invalid data — verify 422 response with validation errors

---

## Long-term Maintenance

- When a new endpoint is added, annotate it in JSDoc at the same time (same file)
- When a response shape changes, update the JSDoc + the shared `config/swagger.ts` schemas
- The raw spec at `/api/docs.json` can feed into API client generators (Postman, OpenAPI Generator for TypeScript clients, etc.)
- If you later add `strict: true` to tsconfig, the JSDoc types won't be affected — they're comments, not TS code
