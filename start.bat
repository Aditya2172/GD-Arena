@echo off
setlocal enabledelayedexpansion
title GD Arena — AI Group Discussion Practice Platform

echo ========================================================
echo   GD ARENA — AI VOICE DISCUSSION PRACTICE PLATFORM
echo   Speak Confidently. Think Critically. Lead Discussions.
echo ========================================================
echo.

:: 1. Navigate to script directory
cd /d "%~dp0"
echo [1/4] Working directory: %CD%

:: 2. Verify Node.js and npm availability
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please ensure Node.js is installed on your Windows system.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
for /f "tokens=*" %%v in ('npm -v') do set NPM_VER=%%v
echo [2/4] Node.js: %NODE_VER% ^| npm: %NPM_VER%

:: 3. Verify dependencies
if not exist "node_modules\" (
    echo [INFO] Installing project dependencies (one-time setup)...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install root dependencies.
        pause
        exit /b 1
    )
)

if not exist "server\dist\" (
    echo [INFO] Building backend server...
    call npm --prefix server run build
)

if not exist "client\dist\" (
    echo [INFO] Building frontend production bundle...
    call npm --prefix client run build
)

:: 4. Check for port conflicts (Port 5000 and 5173)
echo [3/4] Verifying network ports...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [NOTE] Port 5000 is already in use by an existing instance or process.
)

netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [NOTE] Port 5173 is already in use by an existing instance or process.
)

:: 5. Launch application
echo.
echo ========================================================
echo [4/4] Starting GD Arena...
echo.
echo   Frontend UI:      http://localhost:5173
echo   Full-Stack URL:   http://localhost:5000
echo   Backend Health:   http://localhost:5000/api/health
echo.
echo   Press Ctrl+C at any time to stop both servers.
echo ========================================================
echo.

call npm run dev
pause
