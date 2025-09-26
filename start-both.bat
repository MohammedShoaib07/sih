@echo off
echo Starting Pothole Detection System...
echo.

echo Starting Flask API in background...
start "Flask API" cmd /c "start-api.bat"

echo Waiting for API to start...
timeout /t 5 /nobreak > nul

echo Starting React development server...
npm run dev

pause
