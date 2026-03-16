# Morgan's Hope — Changelog

## v3.0.0 — Bug Fixes (Local Testing) — 2026-03-03

### Summary
All bugs discovered during local Windows testing have been fixed.
The frontend was working; the backend was not saving accounts, not storing images,
and not returning results to the frontend.

---

### Backend Fixes

#### 1. Auth — `normalizeEmail()` removed (critical)
**File:** `src/controllers/authController.ts`
**Problem:** `express-validator`'s `.normalizeEmail()` mutates the email before it
reaches the controller — it strips dots, forces `+tag` removal, etc.
This caused a mismatch: register stored `ahmed.hassan@gmail.com` but login looked
up `ahmedhassangmail.com`, returning "Invalid email or password" even with correct credentials.

**Fix:** Removed `.normalizeEmail()`. Email is now only lowercased + trimmed via a
`.customSanitizer()` so the exact value is stored and compared consistently.

---

#### 2. Auth — Password validation error messages separated
**File:** `src/controllers/authController.ts`
**Problem:** One chained `.matches()` rule gave a single vague error for missing uppercase/lowercase/number.
**Fix:** Separated into three distinct `.matches()` rules, each with its own message.

---

#### 3. Analysis — `urgencyLevel` missing from API response (critical)
**File:** `src/controllers/analysisController.ts`
**Problem:** `urgencyLevel` is a Sequelize virtual getter (computed property on the model instance).
When Sequelize calls `.toJSON()` internally to build the JSON response, virtual getters are
**not included**. The frontend received `urgencyLevel: undefined`, which broke the Results page
colour coding and badges.

**Fix:** Added `computeUrgency()` pure function. Called explicitly after every DB read and
result spread into `{ ...result.toJSON(), urgencyLevel }` before responding.

---

#### 4. Analysis — `imageType` not normalised (medium)
**File:** `src/controllers/analysisController.ts`
**Problem:** Frontend was sending `imageType: "CT"` (uppercase) but backend checked `['xray', 'ct']`.
The check failed → uploaded file was deleted → user got a 400 error.

**Fix:** Added `.toLowerCase()` before the validation check.

---

#### 5. Upload path broken on Windows (critical)
**File:** `src/middleware/upload.ts`
**Problem:** `path.join(__dirname, '../uploads')` resolves to different directories depending
on whether the code is run via `ts-node` (from `src/`) or compiled JS (from `dist/`).
On Windows with ts-node the path was inside `src/` and the `uploads/` folder was never
found or created consistently.

**Fix:** Changed to `path.join(process.cwd(), 'uploads')` — always relative to the project
root where `npm run dev` is executed. The directory is auto-created on import.

---

#### 6. Server — CORS blocking frontend (high)
**File:** `src/server.ts`
**Problem:** CORS was hard-coded to `FRONTEND_URL` only. In development the browser
sends `Origin: http://localhost:3001` but any other port or tool (Postman, other tabs)
was blocked with a CORS error.

**Fix:** In `NODE_ENV=development`, all origins are allowed. In production, `FRONTEND_URL` is enforced.

---

#### 7. Rate limiting blocked register/login during testing (high)
**File:** `src/server.ts`
**Problem:** Auth rate limit was set to 10 requests per 15 minutes. During local testing
(register + login + refresh cycles), this was hit in minutes, locking the developer out.

**Fix:** Rate limiting is **disabled entirely** when `NODE_ENV=development`.
In production it remains active (50 auth / 15 min, 200 global / 15 min).

---

#### 8. Error swallowed on file delete failure (Windows) (low)
**File:** `src/controllers/analysisController.ts`
**Problem:** `fs.unlinkSync()` throws on Windows if the file is locked (e.g. still being
read by the upload stream). The uncaught error masked the real failure.

**Fix:** All `fs.unlinkSync()` calls wrapped in `try/catch`.

---

### AI Service Fixes

#### 9. Local model path not supported (critical)
**Files:** `ai/ct_service/main.py`, `ai/xray_service/main.py`
**Problem:** Services only looked for `model.pt` next to the script, or auto-downloaded
from HuggingFace. Users with the model at a custom Windows path (e.g.
`G:\Graduation Project\Ai\...`) had no way to point the service at it.

**Fix:** Added environment variable resolution:
- `CT_MODEL_PATH`   — absolute path to CT model `.pt` file
- `XRAY_MODEL_PATH` — absolute path to X-Ray model `.pt` file

Resolution order: env var → `model.pt` next to script → HuggingFace download.

---

#### 10. Improved logging for model loading
**Files:** `ai/ct_service/main.py`, `ai/xray_service/main.py`
**Problem:** No clear indication in the logs of which model file was being loaded.
**Fix:** Added timestamped log lines at every step: path found, loading, ready.

---

### Configuration Fixes

#### 11. `.env.example` — DB_PASSWORD empty by default
**File:** `backend/.env.example`
**Problem:** `.env.example` had `DB_PASSWORD=your_password_here` — the placeholder
caused Sequelize to try connecting with the literal string as the password.

**Fix:** `DB_PASSWORD=` (empty) to match MySQL `--initialize-insecure` setup.

---

### How to Use Local Model Files

Instead of waiting for HuggingFace download, set env vars before starting each service:

**Windows (PowerShell):**
```powershell
# CT Service
$env:CT_MODEL_PATH = "G:\New folder (5)\Graduation Project\Ai\Medtech-AI\For Backend (CT)\lung_cancer_torchscript.pt"
uvicorn main:app --port 8000

# X-Ray Service  
$env:XRAY_MODEL_PATH = "G:\New folder (5)\Graduation Project\Ai\Medtech-AI\For Backend (X-RAY)\lung_xray_torchscript.pt"
uvicorn main:app --port 8001
```

**Or copy model files next to main.py and rename to `model.pt`:**
```
ai/ct_service/model.pt    ← copy lung_cancer_torchscript.pt here
ai/xray_service/model.pt  ← copy lung_xray_torchscript.pt here
```
