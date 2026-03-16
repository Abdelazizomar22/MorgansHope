
# ============================================================
#  Morgan's Hope — Stop All Local Services
#  Usage: .\stop-local.ps1
# ============================================================

function Write-Ok  { param($msg) Write-Host "  ✔ $msg" -ForegroundColor Green  }
function Write-Warn{ param($msg) Write-Host "  ⚠ $msg" -ForegroundColor DarkYellow }

$ports = @{
    3000 = "Backend"
    3001 = "Frontend"
    8000 = "CT AI Service"
    8001 = "X-Ray AI Service"
}

Write-Host "`n  Stopping Morgan's Hope services...`n" -ForegroundColor Cyan

foreach ($port in $ports.Keys) {
    $name   = $ports[$port]
    $netstat = netstat -ano 2>$null | Select-String ":$port\s.*LISTENING"
    if ($netstat) {
        # Extract PIDs
        $pids = $netstat | ForEach-Object {
            ($_.Line.Trim() -split '\s+')[-1]
        } | Select-Object -Unique
        foreach ($pid in $pids) {
            try {
                Stop-Process -Id ([int]$pid) -Force -ErrorAction SilentlyContinue
                Write-Ok "Stopped $name (port $port, PID $pid)"
            } catch {
                Write-Warn "Could not stop PID $pid for $name"
            }
        }
    } else {
        Write-Warn "$name (port $port) was not running."
    }
}

Write-Host "`n  All services stopped.`n" -ForegroundColor Cyan
