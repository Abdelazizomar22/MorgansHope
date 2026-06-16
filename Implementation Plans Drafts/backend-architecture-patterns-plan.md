# Backend Architecture & Patterns Implementation Plan

## Pattern Feasibility Analysis

### Current State

Monolithic Express + Sequelize (PostgreSQL/SQLite) backend with ~8 routes, ~5 models. A service layer is being introduced. The team is a graduation group — maintainability matters, but shipping matters more.

---

### Result Pattern — ✅ DO THIS

**Problem:** Two inconsistent error styles across the codebase:

```ts
// Style A — early return with res.json
if (!user) { res.status(401).json({ success: false, message: '...' }); return; }

// Style B — thrown, caught by asyncHandler wrapper
throw new Error('...');
```

You can't tell from a function's signature whether it can fail, or how.

**The pattern:**

```ts
type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };
```

**Where it fits:**

| Layer | Before | After |
|---|---|---|
| Services (new) | Throws or returns raw data | Returns `Result<T>` |
| Repositories (if added) | Throws on DB error | Returns `Result<T>` |
| AI client calls | Throws on service down | Returns `Result<AiResponse>` |
| Controllers | try/catch or early res.json | Switch on `result.success` |

**Example — service:**

```ts
// services/authService.ts
async function registerUser(data: RegisterInput): Promise<Result<{ user: SafeUser; token: string }>> {
  const existing = await User.findOne({ where: { email: data.email } });
  if (existing) return { success: false, error: 'Email already registered' };

  const hashed = await bcrypt.hash(data.password, 12);
  const user = await User.create({ ...data, password: hashed });
  const token = makeAccessToken(user.id);

  return { success: true, data: { user: user.toSafeJSON(), token } };
}
```

**Example — controller (thin):**

```ts
// controllers/authController.ts
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);

  if (!result.success) {
    return res.status(409).json({ success: false, message: result.error });
  }

  res.status(201).json({ success: true, data: result.data });
});
```

**What you need:**

```
src/types/result.ts     ← Result<T> type definition
```

**Verdict:** Low complexity, high value. Fully compatible with Express + TypeScript. Use discriminated unions — no libraries needed. Pairs perfectly with the planned service layer.

---

### Clean Architecture — ⚠️ DO "CLEAN-ISH"

**What full Clean Architecture asks for:**

```
Frameworks (Express, Sequelize)  →  Adapters (controllers, repositories)
  →  Use Cases (services)  →  Entities (models)
  →  Dependency Inversion: inner layers know nothing about outer layers
```

**Current coupling:**

```
Controllers → Models (tight to Sequelize)
Controllers → AI calls (tight to axios)
```

**The problem with full Clean Architecture here:**

Your project has ~8 entities, ~15 endpoints, no complex domain workflows. Full Clean Architecture (abstract interfaces for every dependency, DI container, strict layer isolation) would add 3-4x boilerplate for minimal practical gain.

**What I recommend — "Clean-ish Architecture":**

```
┌─────────────────────────────────────────┐
│  Controllers        ← Express req/res   │
│  (parse, delegate, respond)             │
├─────────────────────────────────────────┤
│  Services           ← business logic    │
│  (uses Sequelize models directly)       │
│  (returns Result<T>, no req/res)        │
├─────────────────────────────────────────┤
│  Repositories       ← optional          │
│  (if query logic gets complex)          │
├─────────────────────────────────────────┤
│  Models             ← Sequelize defs    │
└─────────────────────────────────────────┘
```

**Rules:**

1. **Controllers** parse `req`/`res`, call services, switch on the `Result`, respond. No SQL, no AI calls.
2. **Services** contain business logic. Never import `Request` or `Response` from Express. Return `Result<T>`.
3. **Models** stay as Sequelize definitions. Services use them directly (no abstract repository interfaces for now).
4. **Repositories** are optional — only introduce them when a query pattern repeats across services.

**What full Clean Architecture would add vs. what you gain:**

| Addition | Cost | Benefit for this project |
|---|---|---|
| Abstract repository interfaces | +1 file per model (5 files) | Swap DB later (will never happen) |
| Dependency injection container | Setup + decorators on every class | Marginal testability improvement |
| Request/Response DTOs per use case | +2 types per endpoint (~30 types) | API contract clarity (nice but heavy) |
| Use Case classes (not functions) | +1 class per action (~15 classes) | Isolated units (functions suffice) |

**Skip the ceremony. Keep the structure.**

**Target directory layout:**

```
src/
├── server.ts
├── config/
│   ├── database.ts
│   └── passport.ts
├── middleware/
│   ├── auth.ts
│   └── upload.ts
├── models/
│   ├── User.ts
│   ├── AnalysisResult.ts
│   ├── Hospital.ts
│   ├── City.ts
│   └── ChatMessage.ts
├── services/
│   ├── analysisService.ts
│   ├── authService.ts
│   ├── hospitalService.ts
│   └── chatService.ts
├── controllers/
│   ├── analysisController.ts
│   ├── authController.ts
│   └── hospitalController.ts
├── routes/
│   ├── analysis.ts
│   ├── auth.ts
│   ├── hospitals.ts
│   └── chat.ts
├── types/
│   └── result.ts
└── utils/
    ├── asyncHandler.ts
    ├── chatAgent.ts
    ├── mailer.ts
    ├── migrate.ts
    ├── otp.ts
    ├── retryWithBackoff.ts
    └── seed.ts
```

---

### CQRS — ❌ SKIP THIS

**What CQRS means:**

- Separate models for commands (writes) and queries (reads)
- Separate handlers, often separate databases
- Eventual consistency between read/write sides

**Why it doesn't fit your project:**

| Requirement | Your project | What CQRS expects |
|---|---|---|
| Read/write model shape | Nearly identical | Very different |
| Query complexity | Simple pagination + filters | Complex aggregations |
| Write complexity | Create + update + delete | Multi-step workflows with side effects |
| Scale | Single server, <1000 users | Millions, separate read replicas |
| Team size | Graduation group | Multiple teams |

**Model-by-model analysis:**

| Model | Read ops | Write ops | CQRS benefit |
|---|---|---|---|
| User | Profile view | Register, update | None — same fields |
| AnalysisResult | History list, detail | Upload (1 path) | None — 1:1 mapping |
| Hospital | Filtered list, detail | Never written via API | None — read-only seed |
| ChatMessage | Conversation history | Append message | None — append-only log |

**The only CQRS-like thing worth borrowing:**

Organize services into `commands/` and `queries/` subdirectories if it helps team navigation. Do not split models or introduce event buses.

```ts
// services/analysis/commands/uploadAnalysis.ts
export async function uploadAnalysis(cmd: { userId: number; file: File; imageType: string }) { ... }

// services/analysis/queries/getHistory.ts
export async function getAnalysisHistory(query: { userId: number; page: number; limit: number }) { ... }
```

**Verdict:** Full CQRS is wrong here. Read/write models are too similar — you'd duplicate code, not reduce it. Use `commands/` + `queries/` folders as an organizational hint if you like, but no infrastructure changes.

---

## Merged Implementation Plan

### Task 1 — Result Pattern

```
src/types/result.ts                          ← CREATE
src/services/authService.ts                  ← use Result<T>
src/services/analysisService.ts              ← use Result<T>
src/services/hospitalService.ts              ← use Result<T>
src/controllers/authController.ts            ← switch on Result
src/controllers/analysisController.ts        ← switch on Result
src/controllers/hospitalController.ts        ← switch on Result
```

**Step 1.1 — Create `src/types/result.ts`**

```ts
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

// Helpers
export const Ok = <T>(data: T): Result<T, never> => ({ success: true, data });
export const Err = <E = string>(error: E): Result<never, E> => ({ success: false, error });
```

**Step 1.2 — Apply to services**

Each service function returns `Result<T>` instead of throwing. The asyncHandler wrapper is no longer needed for service calls — controllers handle the `success` field explicitly.

**Step 1.3 — Update controllers**

Replace:
```ts
try {
  const data = await riskyCall();
  res.json({ success: true, data });
} catch (err) {
  res.status(500).json({ success: false, message: '...' });
}
```

With:
```ts
const result = await riskyCall();
if (!result.success) {
  return res.status(400).json({ success: false, message: result.error });
}
res.json({ success: true, data: result.data });
```

**Step 1.4 — Keep asyncHandler for unexpected errors**

The asyncHandler wrapper still catches genuinely unexpected errors (programming mistakes, DB connection failures) that were never meant to return as `Result.Err`.

---

### Task 2 — Clean-ish Architecture Restructure

| Action | File |
|---|---|
| CREATE | `src/services/analysisService.ts` |
| CREATE | `src/services/authService.ts` |
| CREATE | `src/services/hospitalService.ts` |
| REWRITE | `src/controllers/analysisController.ts` (thin wrapper) |
| REWRITE | `src/controllers/authController.ts` (thin wrapper) |
| REWRITE | `src/controllers/hospitalController.ts` (thin wrapper) |
| KEEP | `src/models/*` (Sequelize models, unchanged) |
| KEEP | `src/routes/*` (unchanged — same imports) |

**Service contract rules:**

```
DO:
- Accept plain objects / primitives as inputs
- Return Result<T>
- Import and use Sequelize models directly
- Contain all business logic & validation
- Use utility functions (chatAgent, mailer, otp)

DON'T:
- Import Request, Response, NextFunction from Express
- Read from req.headers, req.cookies, req.query
- Send HTTP responses
- Import middleware
```

**Controller contract rules:**

```
DO:
- Parse req.params, req.query, req.body, req.file
- Call one service function per handler
- Switch on Result and send response
- Set cookies, headers as needed

DON'T:
- Write SQL or Sequelize queries
- Call AI services directly
- Contain business logic beyond request parsing
```

---

### Task 3 — Hospital Data Deduplication

(See `hospital-data-route-service-plan.md` for full breakdown. Summary:)

- Enrich `models/Hospital.ts` with missing fields (coordinates, bilingual, about, services, type, etc.)
- Move in-memory data from `hospitalController.ts` into `seed.sql` + `utils/seed.ts`
- Controller queries DB via service
- Frontend deletes `data/hospitals.ts`, fetches from API instead

---

### Task 4 — Unify Route Mounting

- Remove bare-prefix mounts from `server.ts` (`/auth`, `/analysis`, etc.) — keep only `/api/...`
- Wrap convenience routes in `if (isDev)` for local curl testing
