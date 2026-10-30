@echo off
setlocal enabledelayedexpansion
title GD Arena Diagnostic Tool

echo ========================================================
echo   GD ARENA — SYSTEM DIAGNOSTIC & HEALTH CHECK
echo ========================================================
echo.

cd /d "%~dp0"
echo [1] Checking Node & npm:
node -v 2>nul || echo Node.js NOT found!
npm -v 2>nul || echo npm NOT found!

echo.
echo [2] Checking Port Listeners:
netstat -ano | findstr ":5000" | findstr "LISTENING" || echo Port 5000: NOT LISTENING
netstat -ano | findstr ":5173" | findstr "LISTENING" || echo Port 5173: NOT LISTENING

echo.
echo [3] Querying Backend Health Endpoint:
powershell -Command "try { $res = Invoke-RestMethod -Uri 'http://localhost:5000/api/health' -TimeoutSec 3; Write-Host 'Backend Status: OK'; $res | ConvertTo-Json -Depth 2 } catch { Write-Host 'Backend Unreachable:' $_.Exception.Message }"

echo.
echo [4] Querying Frontend Server (5173):
powershell -Command "try { $res = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 3 -UseBasicParsing; Write-Host 'Frontend (5173) Status:' $res.StatusCode } catch { Write-Host 'Frontend (5173) Unreachable:' $_.Exception.Message }"

echo.
echo ========================================================
echo Diagnostic complete.
pause
