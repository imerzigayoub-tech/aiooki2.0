@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if errorlevel 1 (
  echo Starting the AIOOOKI preview server...
  start "AIOOOKI Preview" /min cmd /c "node serve.mjs"
  powershell -NoProfile -Command "Start-Sleep -Milliseconds 1200"
)

start "" "http://localhost:4173/"
