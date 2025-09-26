#!/bin/bash

echo "Starting Pothole Detection API..."
echo

cd "$(dirname "$0")/api"

echo "Checking if virtual environment exists..."
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing/updating dependencies..."
pip install -r requirements.txt

echo
echo "Starting Flask API server..."
echo "API will be available at: http://localhost:5000"
echo "Health check: http://localhost:5000/api/v1/health"
echo

python app.py
