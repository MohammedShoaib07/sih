@echo off
echo Starting Pothole Detection API...
echo.

cd /d "%~dp0api"

echo Checking if virtual environment exists...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing/updating dependencies...
pip install -r requirements.txt

echo.
echo Starting Flask API server...
echo API will be available at: http://localhost:5000
echo Health check: http://localhost:5000/api/v1/health
echo.

python app.py

pause
