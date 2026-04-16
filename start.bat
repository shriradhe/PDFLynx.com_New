@echo off
echo ============================================
echo   PDFLynx - Quick Start Script (Windows)
echo ============================================
echo.

echo [1/4] Installing server dependencies...
cd /d "%~dp0server"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Server npm install failed!
    pause
    exit /b 1
)
echo Server dependencies installed OK.
echo.

echo [2/4] Installing client dependencies...
cd /d "%~dp0client"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Client npm install failed!
    pause
    exit /b 1
)
echo Client dependencies installed OK.
echo.

echo [3/4] Starting server (background)...
cd /d "%~dp0server"
start "PDFLynx Server" cmd /k "npm run dev"
echo Server starting on http://localhost:5000
echo.

echo [4/4] Starting client (background)...
cd /d "%~dp0client"
start "PDFLynx Client" cmd /k "npm run dev"
echo Client starting on http://localhost:5173
echo.

echo ============================================
echo   PDFLynx is starting!
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   Health:   http://localhost:5000/api/health
echo ============================================
echo.
echo NOTE: Make sure MongoDB is running on localhost:27017
echo AI features work in DEMO mode without OpenAI API key.
echo.
pause
