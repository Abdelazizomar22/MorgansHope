
# ============================================================
#  Morgan's Hope — Local Development Startup Script
#  Run from project root (folder containing frontend/, backend/, ai/).
#  Usage: .\start-local.ps1
#         .\start-local.ps1 -SkipAI          (skip AI services)
#         .\start-local.ps1 -ResetDB         (drop + re-migrate + re-seed DB)
#         .\start-local.ps1 -NoBrowser       (don't auto-open browser)
# ============================================================
param(
    [switch]$SkipAI,
    [switch]$ResetDB,
    [switch]$NoBrowser
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Colours
function Write-Header  { param($msg) Write-Host "`n========================================" -ForegroundColor Cyan
                                     Write-Host "  $msg"                                    -ForegroundColor Cyan
                                     Write-Host "========================================`n" -ForegroundColor Cyan }
function Write-Step    { param($msg) Write-Host "  > $msg" -ForegroundColor Yellow }
function Write-Ok      { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green  }
function Write-Warn    { param($msg) Write-Host "  [!] $msg" -ForegroundColor DarkYellow }
function Write-Err     { param($msg) Write-Host "  [X] $msg" -ForegroundColor Red    }
function Write-Info    { param($msg) Write-Host "  i $msg" -ForegroundColor Gray   }

# Paths
$Root         = $PSScriptRoot
$BackendDir   = Join-Path $Root "backend"
$FrontendDir  = Join-Path $Root "frontend"
$CtDir        = Join-Path $Root "ai\ct_service"
$XrayDir      = Join-Path $Root "ai\xray_service"
$BackendEnv   = Join-Path $BackendDir ".env"
$BackendEnvEx = Join-Path $BackendDir ".env.example"

# Log file
$LogDir = Join-Path $Root ".logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

function Get-LogPath { param($name) return Join-Path $LogDir "${name}_${Timestamp}.log" }

Write-Header "Morgan's Hope - Local Dev Startup"
Write-Info "Root: $Root"
Write-Info "Log directory: $LogDir"
if ($SkipAI)   { Write-Warn "AI services will be SKIPPED" }
if ($ResetDB)  { Write-Warn "Database will be RESET (migrate --force + seed)" }

# 1. PRE-FLIGHT CHECKS
Write-Header "1. Pre-flight Checks"

# Node.js
Write-Step "Checking Node.js..."
try {
    $nodeVer = (node --version 2>$null)
    $nodeMajor = [int]($nodeVer -replace 'v(\d+)\..*','$1')
    if ($nodeMajor -lt 18) {
        Write-Err "Node.js $nodeVer found but version 18+ is required."
        exit 1
    }
    Write-Ok "Node.js $nodeVer"
} catch {
    Write-Err "Node.js not found. Install from https://nodejs.org/"
    exit 1
}

# npm
Write-Step "Checking npm..."
try {
    $npmCmd = (Get-Command npm -ErrorAction Stop).Source
    $npmVer = & $npmCmd --version 2>$null
    Write-Ok "npm $npmVer (`"$npmCmd`")"
} catch {
    Write-Err "npm not found."
    exit 1
}

# Python (optional when -SkipAI)
if (-not $SkipAI) {
    Write-Step "Checking Python..."
    $pythonCmd = $null
    foreach ($cmd in @("python", "python3", "py")) {
        try {
            $ver = & $cmd --version 2>&1
            if ($ver -match "Python 3") { $pythonCmd = $cmd; break }
        } catch {}
    }
    if ($null -eq $pythonCmd) {
        Write-Warn "Python 3 not found - skipping AI services (run with -SkipAI to silence this warning)."
        $SkipAI = $true
    } else {
        $pyVer = (& $pythonCmd --version 2>&1)
        Write-Ok "$pyVer (command: $pythonCmd)"
    }
}

# MySQL client
Write-Step "Checking MySQL client..."
$mysqlCmd = $null
foreach ($candidate in @("mysql", "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe", "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe")) {
    if (Get-Command $candidate -ErrorAction SilentlyContinue) { $mysqlCmd = $candidate; break }
}
if ($null -eq $mysqlCmd) {
    Write-Warn "MySQL client not found in PATH. DB creation will be skipped (assuming DB already exists)."
} else {
    Write-Ok "MySQL client found: $mysqlCmd"
}

Write-Ok "All critical pre-flight checks passed.`n"

# 2. CONFIGURE BACKEND .ENV
Write-Header "2. Backend Environment"

if (-not (Test-Path $BackendEnv)) {
    if (Test-Path $BackendEnvEx) {
        Copy-Item $BackendEnvEx $BackendEnv
        Write-Ok "Created backend/.env from .env.example"
    } else {
        Write-Err "No backend/.env or .env.example found!"
        exit 1
    }
}

# Read current .env
$envContent = Get-Content $BackendEnv -Raw
$envLines   = Get-Content $BackendEnv

function Get-EnvVal { param($key)
    $line = $envLines | Where-Object { $_ -match "^\s*$key\s*=" } | Select-Object -First 1
    if ($line) { return ($line -split "=", 2)[1].Trim() }
    return ""
}

$dbHost     = Get-EnvVal "DB_HOST"
$dbPort     = Get-EnvVal "DB_PORT"
$dbName     = Get-EnvVal "DB_NAME"
$dbUser     = Get-EnvVal "DB_USER"
$dbPassword = Get-EnvVal "DB_PASSWORD"

if (-not $dbHost)     { $dbHost     = "localhost" }
if (-not $dbPort)     { $dbPort     = "3306"      }
if (-not $dbName)     { $dbName     = "medtech_db" }
if (-not $dbUser)     { $dbUser     = "root"       }

Write-Info "DB_HOST=$dbHost  DB_PORT=$dbPort  DB_NAME=$dbName  DB_USER=$dbUser"

# If DB_PASSWORD is empty, prompt user
if ($dbPassword -eq "") {
    Write-Warn "DB_PASSWORD is empty in backend/.env"
    $secPwd = Read-Host -Prompt "  Enter MySQL password for '$dbUser' (leave blank if none)" -AsSecureString
    $bstr   = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secPwd)
    $dbPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

    # Persist to .env so next run won't ask again
    $envContent = $envContent -replace "(?m)^DB_PASSWORD=.*$", "DB_PASSWORD=$dbPassword"
    Set-Content $BackendEnv $envContent -NoNewline
    Write-Ok "DB_PASSWORD saved to backend/.env"
}

# 3. DATABASE SETUP
Write-Header "3. Database Setup"

# Helper: run a MySQL command
function Invoke-MySQL { param([string]$Sql)
    if ($null -eq $mysqlCmd) { return $false }
    $args = @("-u", $dbUser, "-h", $dbHost, "--port", $dbPort)
    if ($dbPassword -ne "") { $args += "-p$dbPassword" }
    $args += "-e"
    $args += $Sql
    $result = & $mysqlCmd @args 2>&1
    return ($LASTEXITCODE -eq 0)
}

# Create DB if not exists
if ($null -ne $mysqlCmd) {
    Write-Step "Creating database '$dbName' if not exists..."
    $created = Invoke-MySQL "CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    if ($created) { Write-Ok "Database ready." }
    else {
        Write-Warn "Could not create database - it may already exist or credentials are wrong. Continuing..."
    }
}

# Install backend dependencies
Write-Step "Installing backend npm dependencies..."
$backendLog = Get-LogPath "backend_install"
Push-Location $BackendDir
$npmInstall = Start-Process "cmd.exe" -ArgumentList "/c","npm","install","--prefer-offline" -NoNewWindow -Wait -PassThru -RedirectStandardOutput $backendLog -RedirectStandardError "$backendLog.err"
if ($npmInstall.ExitCode -ne 0) { Write-Warn "npm install had warnings/errors - check ${backendLog}.err" }
else { Write-Ok "Backend dependencies installed." }
Pop-Location

# Migrate
Write-Step "Running database migrations (npm run migrate)..."
Push-Location $BackendDir
$migrateLog = Get-LogPath "migrate"
if ($ResetDB) {
    # Use force sync for reset
    $env:DB_SYNC_FORCE = "true"
}
$migrateProc = Start-Process "cmd.exe" -ArgumentList "/c","npm","run","migrate" -NoNewWindow -Wait -PassThru -RedirectStandardOutput $migrateLog -RedirectStandardError "$migrateLog.err"
$env:DB_SYNC_FORCE = ""
if ($migrateProc.ExitCode -ne 0) {
    Write-Err "Migration failed! Check $migrateLog"
    Write-Info (Get-Content "$migrateLog.err" -Raw -ErrorAction SilentlyContinue)
    exit 1
}
Write-Ok "Migrations complete."
Pop-Location

# Seed
Write-Step "Running database seed (npm run seed)..."
Push-Location $BackendDir
$seedLog = Get-LogPath "seed"
$seedProc = Start-Process "cmd.exe" -ArgumentList "/c","npm","run","seed" -NoNewWindow -Wait -PassThru -RedirectStandardOutput $seedLog -RedirectStandardError "$seedLog.err"
Pop-Location
if ($seedProc.ExitCode -ne 0) {
    Write-Warn "Seed returned non-zero exit (data may already exist - not a blocking error)."
    Write-Info (Get-Content "$seedLog.err" -Raw -ErrorAction SilentlyContinue)
} else {
    Write-Ok "Seed complete."
}

# 4. INSTALL FRONTEND DEPENDENCIES
Write-Header "4. Frontend Dependencies"
Write-Step "Installing frontend npm dependencies..."
Push-Location $FrontendDir
$feLog = Get-LogPath "frontend_install"
$feProc = Start-Process "cmd.exe" -ArgumentList "/c","npm","install","--prefer-offline" -NoNewWindow -Wait -PassThru -RedirectStandardOutput $feLog -RedirectStandardError "$feLog.err"
if ($feProc.ExitCode -ne 0) { Write-Warn "npm install had warnings/errors - check ${feLog}.err" }
else { Write-Ok "Frontend dependencies installed." }
Pop-Location

# 5. START SERVICES
Write-Header "5. Starting Services"

$jobs = @{}

function Start-Service {
    param([string]$Name, [string]$Dir, [string]$Command, [string]$CmdArgs, [string]$Color = "White")
    $log = Get-LogPath $Name
    Write-Step "Starting $Name -> $log"
    # Use a new PowerShell window so the user can see each service's output separately
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "powershell.exe"
    $psi.Arguments = "-NoExit -Command `"`$Host.UI.RawUI.WindowTitle = '$Name'; cd '$Dir'; $Command $CmdArgs 2>&1 | Tee-Object -FilePath '$log'`""
    $psi.WorkingDirectory = $Dir
    $psi.UseShellExecute  = $true
    $proc = [System.Diagnostics.Process]::Start($psi)
    $jobs[$Name] = $proc
    Write-Ok "$Name started (PID $($proc.Id))"
    return $proc
}

# AI Services
if (-not $SkipAI) {
    # Check if uvicorn / pip is available
    $uvicornOk = $false
    try { & $pythonCmd -m uvicorn --version 2>$null | Out-Null; $uvicornOk = $true } catch {}

    if (-not $uvicornOk) {
        Write-Warn "uvicorn not found globally - will use pip install inside service dirs."
    }

    Start-Service -Name "CT-Service"    -Dir $CtDir   -Command "$pythonCmd -m uvicorn" -CmdArgs "main:app --port 8000 --reload"
    Start-Sleep -Seconds 2
    Start-Service -Name "XRay-Service" -Dir $XrayDir  -Command "$pythonCmd -m uvicorn" -CmdArgs "main:app --port 8001 --reload"
    Start-Sleep -Seconds 2
}

# Backend
Start-Service -Name "Backend"  -Dir $BackendDir  -Command "npm" -CmdArgs "run dev"
Start-Sleep -Seconds 3

# Frontend
Start-Service -Name "Frontend" -Dir $FrontendDir -Command "npm" -CmdArgs "run dev"
Start-Sleep -Seconds 3

# 6. HEALTH CHECK LOOP
Write-Header "6. Waiting for Services to be Ready"

function Wait-ForEndpoint {
    param([string]$Name, [string]$Url, [int]$MaxAttempts = 30, [int]$DelayMs = 2000)
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($resp.StatusCode -lt 500) {
                Write-Ok "$Name is UP at $Url"
                return $true
            }
        } catch { }
        Write-Info "  Waiting for $Name... attempt $i/$MaxAttempts"
        Start-Sleep -Milliseconds $DelayMs
    }
    Write-Err "$Name did not respond in time at $Url"
    return $false
}

$backendReady  = Wait-ForEndpoint -Name "Backend"  -Url "http://localhost:3000/api/health" -MaxAttempts 30
$frontendReady = Wait-ForEndpoint -Name "Frontend" -Url "http://localhost:3001"             -MaxAttempts 30

# 7. SUMMARY
Write-Header "7. System Status"

Write-Host ""
Write-Host "  +----------------------------------------------+" -ForegroundColor Cyan
Write-Host "  |           Morgan's Hope - Running            |" -ForegroundColor Cyan
Write-Host "  +----------------------------------------------+" -ForegroundColor Cyan
Write-Host "  |  Frontend  ->  http://localhost:3001         |" -ForegroundColor White
Write-Host "  |  Backend   ->  http://localhost:3000/api     |" -ForegroundColor White
Write-Host "  |  Health    ->  http://localhost:3000/api/health|" -ForegroundColor White
if (-not $SkipAI) {
Write-Host "  |  CT  AI    ->  http://localhost:8000/health  |" -ForegroundColor White
Write-Host "  |  XRay AI   ->  http://localhost:8001/health  |" -ForegroundColor White
}
Write-Host "  +----------------------------------------------+" -ForegroundColor Cyan
Write-Host "  |  Login:  admin@medtech.com                   |" -ForegroundColor Green
Write-Host "  |  Pass :  Admin@123456                        |" -ForegroundColor Green
Write-Host "  +----------------------------------------------+" -ForegroundColor Cyan
Write-Host "  |  Logs directory: .logs\                      |" -ForegroundColor Gray
Write-Host "  +----------------------------------------------+" -ForegroundColor Cyan
Write-Host ""

# Open browser
if (-not $NoBrowser -and $frontendReady) {
    Write-Step "Opening browser..."
    Start-Process "http://localhost:3001"
    Write-Ok "Browser opened."
}

if (-not $backendReady) {
    Write-Warn "Backend may not be ready yet - check the Backend window for errors."
    Write-Info "Common fix: make sure MySQL is running and DB_PASSWORD is correct in backend/.env"
}

Write-Header "Done! Press Ctrl+C here to see this summary again."
Write-Info "Close the individual service windows to stop those services."
