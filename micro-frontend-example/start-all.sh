#!/bin/bash

# Clean up previous processes
echo "Cleaning up previous processes..."
pkill -f "node server.js" || true
pkill -f "vite" || true

# Build the feature app first
echo "Building feature app..."
cd feature-app/frontend
rm -rf dist
npm run build

# Start feature app preview server
echo "Starting feature app preview server..."
npm run preview &
FEATURE_APP_PID=$!

# Start feature app backend
echo "Starting feature app backend..."
cd ../backend
node server.js &
FEATURE_BACKEND_PID=$!

# Start main app backend
echo "Starting main app backend..."
cd ../../main-app/backend
node server.js &
MAIN_BACKEND_PID=$!

# Start main app frontend
echo "Starting main app frontend..."
cd ../frontend
npm run dev &
MAIN_APP_PID=$!

echo "All services started!"
echo "Main App: http://localhost:5000"
echo "Feature App: http://localhost:5001"

# Check if feature app is accessible
echo "Checking if feature app is accessible..."
sleep 3
curl -I http://localhost:5001/assets/assets/remoteEntry.js

# Wait for user to press Ctrl+C
echo "Press Ctrl+C to stop all services"
trap "kill $FEATURE_APP_PID $FEATURE_BACKEND_PID $MAIN_BACKEND_PID $MAIN_APP_PID; exit" INT
wait 