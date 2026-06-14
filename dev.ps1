# dev.ps1 - Unified development starter
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Shram Jagaran CMS Development Environment..." -ForegroundColor Cyan

# 1. Ensure .env is present
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found! Please copy it from .env.example" -ForegroundColor Red
    exit 1
}

# 2. Start Backend in a new window (using Air for live reload)
Write-Host "⚙️ Starting Backend (Live Reload)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; air"

# 3. Start Frontend in a new window
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`n✅ Both services are starting in separate windows." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend Health: http://localhost:8080/health"
