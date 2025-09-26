#!/bin/bash

echo "Starting Pothole Detection System..."
echo

echo "Starting Flask API in background..."
./start-api.sh &
API_PID=$!

echo "Waiting for API to start..."
sleep 5

echo "Starting React development server..."
npm run dev

# Kill API when React server stops
kill $API_PID 2>/dev/null
