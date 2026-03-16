# Morgan's Hope — Project Specification (SPEC)
## Lung Cancer AI Detection System — v2.0

> This document is the **single source of truth**. Every feature, API contract,
> data schema, and UI behaviour is defined here. Paths refer to the **project root** (repository root: `frontend/`, `backend/`, `ai/`).

---

## 1. System Overview

| Item | Value |
|------|-------|
| Project | MedTech Graduation Project 2025/2026 |
| Stack | React 18 + Vite (Frontend) · Node/Express/TypeScript + MySQL (Backend) · FastAPI/Python (AI) |
| Ports | Frontend: 3001 · Backend: 3000 · CT Service: 8000 · X-Ray Service: 8001 |
| Auth | Dual-Token (JWT 15m + Refresh Cookie 7d) · bcrypt (rounds=12) |
| Security | HttpOnly + SameSite=Strict Refresh Cookies · X-Request-ID Tracing · Gzip |
| Models | Abooz65/medtech-ct-model · Abooz65/medtech-xray-model |

---

## 2. Data Contracts (API Shapes)

### 2.1 Auth

#### POST /api/auth/register
```
Request:  { firstName, lastName, email, password, confirmPassword, phone? }
Response: { success, message, data: { user: SafeUser, token: string } }
Errors:   422 validation · 409 email exists
```

#### POST /api/auth/login
```
Request:  { email, password, rememberMe? }
Response: { success, message, data: { user: SafeUser, token: string } }
Set-Cookie: medtech_refresh=<token>; HttpOnly; SameSite=Strict;
Errors:   422 validation · 401 invalid credentials
```

#### POST /api/auth/refresh  [Cookie]
```
Request:  Refresh Cookie
Response: { success, message, data: { user: SafeUser, token: string } }
Set-Cookie: medtech_refresh=<new_token>; HttpOnly;
Description: Silent renewal of access token (interceptor-driven).
```

#### POST /api/auth/logout
```
Response: { success, message }
Clear-Cookie: medtech_refresh
Description: Clears session and invalidates refresh token.
```

#### GET /api/auth/me  [JWT]
```
Response: { success, message, data: SafeUser }
```

#### PUT /api/auth/profile  [JWT]
```
Request:  { firstName?, lastName?, phone?, currentPassword?, newPassword? }
Response: { success, message, data: SafeUser }
```

### 2.2 Analysis

#### POST /api/analysis/upload  [JWT · multipart/form-data]
```
Fields:   image (File) · imageType ("xray" | "ct")
Response: { success, message, data: { result: AnalysisResult, urgencyLevel, recommendedHospitals[], processingTimeMs } }
Errors:   400 no file · 400 bad imageType · 503 AI unavailable
```

#### GET /api/analysis/history  [JWT]
```
Query:    ?page=1&limit=10
Response: { success, message, data: AnalysisResult[], pagination: { page, limit, total, totalPages } }
```

#### GET /api/analysis/:id  [JWT]
```
Response: { success, message, data: AnalysisResult }
Errors:   404 not found
```

#### DELETE /api/analysis/:id  [JWT]
```
Response: { success, message }
```

### 2.3 Hospitals

#### GET /api/hospitals  [JWT]
```
Query:    ?city=Cairo&specialization=Oncology&search=text&page=1&limit=10
Response: { success, message, data: Hospital[], pagination }
```

#### GET /api/hospitals/cities  [JWT]
```
Response: { success, message, data: City[] }
```

#### GET /api/hospitals/:id  [JWT]
```
Response: { success, message, data: Hospital }
```

### 2.4 Health (public)
```
GET /api/health
Response: { success, data: { server, ai: { ctService, xrayService }, timestamp } }
```

---

## 3. Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK AUTO | |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) UNIQUE | NOT NULL |
| password | VARCHAR(255) | bcrypt hashed |
| phone | VARCHAR(20) | nullable |
| role | ENUM(user, admin) | default: user |
| is_active | BOOLEAN | default: true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### cities
| Column | Type |
|--------|------|
| id | INT PK |
| city_name | VARCHAR(100) |
| state | VARCHAR(100) |
| country | VARCHAR(100) DEFAULT 'Egypt' |

### hospitals
| Column | Type |
|--------|------|
| id | INT PK |
| city_id | INT FK → cities.id |
| hospital_name | VARCHAR(255) |
| specialization | VARCHAR(255) |
| address | TEXT |
| phone | VARCHAR(30) |
| website | VARCHAR(255) |
| rating | DECIMAL(2,1) |
| total_reviews | INT |
| image_url | VARCHAR(500) |
| is_active | BOOLEAN |

### analysis_results
| Column | Type |
|--------|------|
| id | INT PK |
| user_id | INT FK → users.id |
| image_type | ENUM(xray, ct) |
| image_path | VARCHAR(500) |
| original_filename | VARCHAR(255) |
| classification | VARCHAR(100) |
| confidence | DECIMAL(5,4) |
| has_findings | BOOLEAN |
| has_cancer | BOOLEAN nullable |
| cancer_probability | DECIMAL(5,4) nullable |
| is_malignant | BOOLEAN nullable |
| all_probabilities | JSON |
| next_step | TEXT nullable |
| status | ENUM(pending, completed, failed) |
| processing_time_ms | INT nullable |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## 4. AI Service Contracts

### CT Scan (port 8000) — POST /predict
```json
Request:  multipart file
Response: {
  "has_cancer": true,
  "cancer_prob": 0.9541,
  "diagnosis": "Adenocarcinoma",
  "confidence": 0.9541,
  "is_malignant": true,
  "all_probs": { "Normal": 0, "Benign": 0, "Adenocarcinoma": 0.95, ... }
}
```

### X-Ray (port 8001) — POST /predict/xray
```json
Request:  multipart file
Response: {
  "has_finding": true,
  "diagnosis": "Nodule/Mass",
  "confidence": 0.98,
  "next_step": "CT Scan recommended",
  "all_probs": { "No Finding": 0.02, "Nodule/Mass": 0.98 }
}
```

---

## 5. Frontend Pages & Behaviour

### /login
- Split layout: left panel (green gradient + lung animation), right panel (form)
- Fields: Email · Password (show/hide toggle)
- On success: save JWT → localStorage('medtech_token') → redirect to /
- On error: inline error message (not alert)
- Link to /register

### /register
- Same split layout
- Fields: First Name · Last Name · Email · Phone (optional) · Password · Confirm Password
- Real-time password strength: 8+ chars · uppercase · lowercase · number
- Passwords match indicator
- On success: save JWT → redirect to /

### / (Home)
- Navbar with: Home · Upload · Analysis · Results · Hospitals · User menu
- Hero: "Early Detection Saves Lives" headline + CTA button
- 3 stat cards: 99% Accuracy · <2s Speed · 6 Cancer Types
- How It Works: 4 steps
- AI Models section

### /upload
- Scan type selector: X-Ray | CT Scan (toggle buttons)
- Drag & drop zone OR click to browse
- File preview after selection (image + filename + size)
- Remove button
- Sidebar: Privacy notice · AI info · Tips
- Submit → POST /api/analysis/upload → redirect to /analysis?id=:id

### /analysis
- Shows animated scan viewer (scanning line animation)
- Progress ring (0→100%)
- Stage indicators: Preprocessing → Loading model → Running inference → Done
- Polls GET /api/analysis/:id every 2s until status === 'completed'
- On complete → redirect to /results?id=:id

### /results
- Tabs: Current Result | History
- Result view:
  - Diagnosis hero card (colour-coded by urgency)
  - Probability bars (animated)
  - Next step recommendation
  - "Find Hospitals" button if malignant
  - Medical disclaimer
- History view: grid of past analyses, click to view, delete button

### /hospitals
- City filter chips
- Search input
- Hospital cards: name · specialization · star rating · address · phone
- "Book Appointment" button (placeholder action)

---

## 6. Urgency Levels

| Level | Condition | Colour |
|-------|-----------|--------|
| none | No findings | Green |
| low | Has findings, no cancer | Green |
| medium | Has cancer, benign | Amber |
| high | Has cancer, malignant, prob < 0.8 | Red |
| critical | Has cancer, malignant, prob ≥ 0.8 | Red |

---

## 7. Security Requirements

- Helmet headers on all responses
- CORS: only allow FRONTEND_URL
- Rate limit: 100 req/15min global · 10 req/15min on /api/auth/
- JWT secret: min 32 chars
- Passwords: bcrypt rounds=12
- File upload: JPG/PNG/WebP only · max 10MB
- No passwords in any API response

---

## 8. Seed Data

Admin: admin@medtech.com / Admin@123456

Egyptian hospitals (8): National Cancer Institute Cairo · Ain Shams · Dar Al Fouad · Alexandria Uni · El Salam Alex · Kasr El Ainy Giza · Mansoura Oncology · South Egypt Cancer Institute
