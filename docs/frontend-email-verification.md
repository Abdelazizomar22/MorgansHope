# Email Verification — Frontend Integration

## Changes Made (Backend)

Registration no longer sets `emailVerified: true` immediately. After account creation, the backend sends a 6-digit verification code to the user's email
and returns `emailVerified: false` in the user object.

## What the Frontend Needs to Do

### 1. After Registration

The `POST /api/auth/register` response now returns:
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "emailVerified": false,
      ...
    },
    "token": "eyJ..."
  }
}
```

**Check `data.user.emailVerified`**. If `false`, show a verification prompt:

> "We sent a 6-digit code to your email. Please enter it below to verify your account."

### 2. Verify Code Endpoint

```
POST /api/auth/verify-contact
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "482917"
}
```

Success response (200):
```json
{
  "success": true,
  "message": "Contact verified",
  "data": { "emailVerified": true, ... }
}
```

Error responses:
- `400` — `"No verification is pending."`
- `400` — `"Verification code expired."`
- `400` — `"Invalid verification code."`

### 3. Resend Code Endpoint

```
POST /api/auth/resend-verification
Authorization: Bearer <token>
Content-Type: application/json

{
  "channel": "email"
}
```

The `channel` field is optional — defaults to `"email"` if the user has a real email.

Success (200):
```json
{
  "success": true,
  "message": "Verification code sent to your email.",
  "data": { "channel": "email" }
}
```

In development, the response also includes `"devCode": "482917"` so you can test without
a real email service.

### 4. UX Flow Suggestion

```
[Register] → [Show "Check your email" screen]
              ↓
         [Code input + Verify button]
              ↓
         [Verify success → redirect to dashboard]
              ↓
         [Resend link if code expired]
```

### 5. Checking Verification Status

The `GET /api/auth/me` endpoint returns `emailVerified` in the user object, so you can
check the status on page load and show a banner if not verified.

## Development Testing

In development (`NODE_ENV !== 'production'`), verification codes are logged to the
server console and returned in the API response as `devCode`. No real email is sent.
