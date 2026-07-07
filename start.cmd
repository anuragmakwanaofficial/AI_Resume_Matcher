@echo off
echo Starting AI Resume Matcher...

echo Starting Backend Server...
start cmd /k "cd backend && .\venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting in separate windows.
