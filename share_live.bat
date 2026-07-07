@echo off
echo ========================================================
echo Starting AI Resume Matcher and making it LIVE for free!
echo ========================================================

echo 1. Starting the Backend Server...
cd backend
start cmd /k "call venv\Scripts\activate.bat && python run.py"
cd ..

echo.
echo 2. Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo 3. Generating a Public Live URL using LocalTunnel...
echo.
echo ========================================================
echo SHARE THIS LINK WITH YOUR FRIENDS / INTERVIEWERS:
echo (The link will be provided below by localtunnel)
echo ========================================================
call npx localtunnel --port 8000
