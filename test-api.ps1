
# ============================================================
#  Morgan's Hope — Quick API Test (no browser needed)
#  Usage:  .\test-api.ps1
#          .\test-api.ps1 -Email "you@test.com" -Password "Pass@1234"
# ============================================================
param(
    [string]$BaseUrl  = "http://localhost:3000/api",
    [string]$Email    = "admin@medtech.com",
    [string]$Password = "Admin@123456"
)

$ErrorActionPreference = "Stop"

function Write-Pass { param($msg) Write-Host "  ✔ PASS  $msg" -ForegroundColor Green  }
function Write-Fail { param($msg) Write-Host "  ✖ FAIL  $msg" -ForegroundColor Red    }
function Write-Info { param($msg) Write-Host "  ℹ $msg"        -ForegroundColor Gray   }
function Write-Head { param($msg) Write-Host "`n── $msg ──" -ForegroundColor Cyan }

function Invoke-Api {
    param(
        [string]$Method  = "GET",
        [string]$Path,
        [object]$Body    = $null,
        [string]$Token   = ""
    )
    $uri     = "$BaseUrl$Path"
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    try {
        $params = @{ Method = $Method; Uri = $uri; Headers = $headers; UseBasicParsing = $true; TimeoutSec = 10 }
        if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 5) }
        $resp = Invoke-WebRequest @params
        return @{ ok = $true; status = $resp.StatusCode; data = ($resp.Content | ConvertFrom-Json) }
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $content = ""
        try { $content = $_.Exception.Response.GetResponseStream() | ForEach-Object { $r = New-Object System.IO.StreamReader $_; $r.ReadToEnd() } } catch {}
        return @{ ok = $false; status = $status; data = $content }
    }
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Morgan's Hope — API Test Suite" -ForegroundColor Cyan
Write-Host "  Base URL : $BaseUrl" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan

$passed = 0
$failed = 0

# ── 1. Health ─────────────────────────────────────────────
Write-Head "Health"
$r = Invoke-Api -Path "/health"
if ($r.ok -and $r.data.success) {
    Write-Pass "GET /health → server:$($r.data.data.server)  ct:$($r.data.data.ai.ctService)  xray:$($r.data.data.ai.xrayService)"
    $passed++
} else {
    Write-Fail "GET /health — Status $($r.status)"
    $failed++
}

# ── 2. Login ─────────────────────────────────────────────
Write-Head "Authentication"
$r = Invoke-Api -Method POST -Path "/auth/login" -Body @{ email = $Email; password = $Password }
if ($r.ok -and $r.data.success) {
    $token = $r.data.data.token
    $user  = $r.data.data.user
    Write-Pass "POST /auth/login → token received  (role: $($user.role))"
    $passed++
} else {
    Write-Fail "POST /auth/login — Status $($r.status)  Body: $($r.data)"
    Write-Info "  Is the DB seeded? Run:  cd backend; npm run seed"
    $failed++
    $token = ""
}

# ── 3. /me ────────────────────────────────────────────────
if ($token) {
    $r = Invoke-Api -Path "/auth/me" -Token $token
    if ($r.ok -and $r.data.success) {
        Write-Pass "GET /auth/me → $($r.data.data.email)"
        $passed++
    } else {
        Write-Fail "GET /auth/me — Status $($r.status)"
        $failed++
    }
}

# ── 4. Hospitals ──────────────────────────────────────────
Write-Head "Hospitals"
if ($token) {
    $r = Invoke-Api -Path "/hospitals" -Token $token
    if ($r.ok -and $r.data.success) {
        $count = $r.data.data.Count
        Write-Pass "GET /hospitals → $count hospitals returned"
        $passed++
    } else {
        Write-Fail "GET /hospitals — Status $($r.status)"
        $failed++
    }

    $r = Invoke-Api -Path "/hospitals/cities" -Token $token
    if ($r.ok -and $r.data.success) {
        Write-Pass "GET /hospitals/cities → $($r.data.data.Count) cities returned"
        $passed++
    } else {
        Write-Fail "GET /hospitals/cities — Status $($r.status)"
        $failed++
    }
}

# ── 5. Analysis history ───────────────────────────────────
Write-Head "Analysis"
if ($token) {
    $r = Invoke-Api -Path "/analysis/history" -Token $token
    if ($r.ok -and $r.data.success) {
        Write-Pass "GET /analysis/history → $($r.data.data.Count) records"
        $passed++
    } else {
        Write-Fail "GET /analysis/history — Status $($r.status)"
        $failed++
    }
}

# ── 6. Refresh Token Test ────────────────────────────────
Write-Head "Token Refresh"
if ($token) {
    # We need to simulate the cookie. Invoke-WebRequest handles cookies via -SessionVariable.
    # First, login again to get the cookie in a session
    $session = $null
    $loginResp = Invoke-WebRequest -Method POST -Uri "$BaseUrl/auth/login" `
        -Body (@{ email = $Email; password = $Password } | ConvertTo-Json) `
        -Headers @{ "Content-Type" = "application/json" } `
        -SessionVariable "session" -UseBasicParsing
    
    if ($loginResp.StatusCode -eq 200) {
        Write-Info "Login session established with refresh cookie."
        
        # Now call refresh
        try {
            $refreshResp = Invoke-WebRequest -Method POST -Uri "$BaseUrl/auth/refresh" `
                -WebSession $session -Headers @{ "Content-Type" = "application/json" } -UseBasicParsing
            
            $refreshData = $refreshResp.Content | ConvertFrom-Json
            if ($refreshData.success) {
                Write-Pass "POST /auth/refresh → success (new token received)"
                $passed++
                $newToken = $refreshData.data.token
            } else {
                Write-Fail "POST /auth/refresh → logic failed: $($refreshData.message)"
                $failed++
            }
        } catch {
            Write-Fail "POST /auth/refresh → Request failed: $($_.Exception.Message)"
            $failed++
        }
    } else {
        Write-Fail "Could not establish session for refresh test."
        $failed++
    }
}

# ── 7. Logout Test ───────────────────────────────────────
Write-Head "Logout"
if ($token) {
    $r = Invoke-Api -Method POST -Path "/auth/logout" -Token $token
    if ($r.ok -and $r.data.success) {
        Write-Pass "POST /auth/logout → success"
        $passed++
        
        # Verify token is now invalid (if we had server-side blacklist)
        # Note: Our current implementation just clears cookie, but Bearer token 
        # is stateless. Testing /me with the OLD token should still work 
        # unless we implemented a blacklist. But let's check /me anyway.
        $r2 = Invoke-Api -Path "/auth/me" -Token $token
        if ($r2.ok) {
            Write-Info "  Note: Bearer token is stateless and still valid until expiry (as expected)."
        }
    } else {
        Write-Fail "POST /auth/logout — Status $($r.status)"
        $failed++
    }
}

# ── 8. Register + Login new user ─────────────────────────
Write-Head "Register New User"
$testEmail = "testuser_$(Get-Date -Format 'HHmmss')@test.com"
$testPass  = "TestPass@9999"
$r = Invoke-Api -Method POST -Path "/auth/register" -Body @{
    firstName       = "Test"
    lastName        = "User"
    email           = $testEmail
    password        = $testPass
    confirmPassword = $testPass
}
if ($r.ok -and $r.data.success) {
    Write-Pass "POST /auth/register → new user created: $testEmail"
    $passed++
    # Login the new user
    $r2 = Invoke-Api -Method POST -Path "/auth/login" -Body @{ email = $testEmail; password = $testPass }
    if ($r2.ok -and $r2.data.success) {
        Write-Pass "POST /auth/login (new user) → success"
        $passed++
    } else {
        Write-Fail "POST /auth/login (new user) — Status $($r2.status)"
        $failed++
    }
} else {
    Write-Fail "POST /auth/register — Status $($r.status)  Body: $($r.data)"
    $failed++
}

# ── Summary ───────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
$total = $passed + $failed
if ($failed -eq 0) {
    Write-Host "  RESULT: $passed/$total tests PASSED ✔" -ForegroundColor Green
} else {
    Write-Host "  RESULT: $passed/$total passed  |  $failed FAILED ✖" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Quick fixes:" -ForegroundColor Yellow
    Write-Host "    DB not seeded  →  cd backend; npm run seed" -ForegroundColor Gray
    Write-Host "    Backend down   →  run .\start-local.ps1 first" -ForegroundColor Gray
    Write-Host "    Wrong password →  .\test-api.ps1 -Password 'YourPass'" -ForegroundColor Gray
}
Write-Host "============================================`n" -ForegroundColor Cyan
