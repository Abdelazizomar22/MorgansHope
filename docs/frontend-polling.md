# Frontend Integration: Queue-Based AI Processing

Both analysis uploads and chat messages now return **immediately** with an ID.
The frontend must **poll** to get the final result.

---

## 1. Image Analysis (Medical Image Upload)

### Step 1 — Upload the image

```
POST /api/analysis/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Fields:
  image     (file, required)
  imageType ("ct" or "xray", required)
  sessionId (string, optional)
```

**Response (202 Accepted) — immediate:**
```json
{
  "success": true,
  "message": "Analysis queued",
  "data": {
    "analysisId": 42,
    "status": "pending"
  }
}
```

### Step 2 — Poll for the result

```
GET /api/analysis/:analysisId
Authorization: Bearer <token>
```

**Poll interval:** every 3 seconds

**While processing (status is `"pending"`):**
```json
{
  "success": true,
  "message": "Analysis retrieved",
  "data": {
    "id": 42,
    "status": "pending",
    "classification": "Pending",
    "confidence": 0,
    "hasFindings": false,
    "allProbabilities": {},
    "urgencyLevel": "none",
    "imageType": "ct",
    "imagePath": "1712345678-123.jpg",
    "originalFilename": "scan.jpg",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**On completion (status is `"completed"`):**
```json
{
  "success": true,
  "message": "Analysis retrieved",
  "data": {
    "id": 42,
    "status": "completed",
    "classification": "Adenocarcinoma",
    "confidence": 0.9567,
    "hasFindings": true,
    "hasCancer": true,
    "cancerProbability": 0.87,
    "isMalignant": true,
    "allProbabilities": {
      "adenocarcinoma": 0.9567,
      "normal": 0.0210,
      "other": 0.0223
    },
    "nextStep": null,
    "urgencyLevel": "critical",
    "imageType": "ct",
    "imagePath": "1712345678-123.jpg",
    "originalFilename": "scan.jpg",
    "processingTimeMs": 45200,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**On failure (status is `"failed"`):**
```json
{
  "success": true,
  "message": "Analysis retrieved",
  "data": {
    "id": 42,
    "status": "failed",
    "classification": "Pending",
    "confidence": 0,
    ...
  }
}
```

### Step 3 — Show appropriate UI

| `status` value | UI state |
|---|---|
| `"pending"` | Show a spinner / progress bar. Continue polling. |
| `"completed"` | Display the result (classification, confidence, urgency, probability bars). Stop polling. |
| `"failed"` | Show error message "AI service unavailable. Please try again." Stop polling. |

### When to stop polling

Stop when `status` is anything other than `"pending"` (i.e., `"completed"` or `"failed"`).

---

## 2. Chat Messages

### Step 1 — Send a message

```
POST /api/chat/
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What do my results mean?",
  "history": []
}
```

**Response (200 OK) — immediate:**
```json
{
  "success": true,
  "data": {
    "messageId": 128,
    "status": "processing"
  }
}
```

Notes:
- The `history` array is optional — it's used for dedup with DB history
- The user's message is already saved in the DB and will appear immediately when you fetch history

### Step 2 — Poll for the reply

```
GET /api/chat/history
Authorization: Bearer <token>
```

**Poll interval:** every 2 seconds

The response is an ordered array of messages (oldest first):

```json
{
  "success": true,
  "data": [
    {
      "role": "user",
      "content": "What do my results mean?",
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Based on your latest CT scan...",
      "createdAt": "2025-01-15T10:30:08.000Z"
    }
  ]
}
```

### Step 3 — How to detect the reply

After sending a message (with `messageId` = M):
1. Fetch `GET /api/chat/history` as before
2. Locate your message in the array (by its `messageId` or by finding the last `role: "user"` entry)
3. If the **next entry** after your user message has `role: "assistant"` — the reply is ready
4. If there is no entry after your user message — keep polling (the worker hasn't finished yet)

### Suggested UX

```
User types message → Send POST /api/chat/
                     → Show user message bubble immediately
                     → Show "typing..." / spinner bubble for pending reply
                     → Poll GET /api/chat/history every 2s
                     → When assistant reply appears:
                       → Replace spinner with the reply text
                       → Stop polling
```

### Edge Cases

- **Slow LLM response**: Worker may take 5–30 seconds depending on API latency, fallback chain, etc. The user sees a typing indicator during this time.
- **Worker failure**: If the worker crashes or the LLM throws an error, no assistant reply will ever appear. To handle this, the frontend should set a **timeout** (e.g., 60 seconds). If no reply after 60s, show "Chat service temporarily unavailable. Please try again."
- **User sends another message before reply arrives**: The new message is stored and queued independently. When polling, filter for replies to the latest message.

---

## 3. Summary

| Endpoint | Request | Response (immediate) | Poll endpoint | Poll field |
|---|---|---|---|---|
| `POST /api/analysis/upload` | multipart with image | `{ analysisId, status: 'pending' }` | `GET /api/analysis/:id` | `data.status` |
| `POST /api/chat/` | JSON `{ message, history }` | `{ messageId, status: 'processing' }` | `GET /api/chat/history` | Look for new `role: 'assistant'` entry |

**Important:** Both endpoints fall back to synchronous processing if Redis is unavailable.
In that case, analysis returns `201` (not `202`) with the full result, and chat returns the
reply inline with `status: 'completed'`. The frontend should handle both cases:

```typescript
// After POST /api/analysis/upload
if (response.data.status === 'pending') {
  // Queue mode — start polling
  pollAnalysis(response.data.analysisId);
} else {
  // Sync fallback mode — result ready immediately
  displayResult(response.data.result);
}
```
