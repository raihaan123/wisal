#!/bin/bash

# Wisal Development Environment Startup Script

echo "🚀 Starting Wisal Development Environment..."

# Function to check if MongoDB is running
check_mongodb() {
    if ! pgrep -x "mongod" > /dev/null; then
        echo "⚠️  MongoDB is not running. Please start MongoDB first."
        echo "   On macOS: brew services start mongodb-community"
        echo "   On Linux: sudo systemctl start mongod"
        exit 1
    fi
    echo "✅ MongoDB is running"
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port is already in use. Please free the port and try again."
        exit 1
    fi
}

# Check prerequisites
echo "Checking prerequisites..."
check_mongodb
check_port 3000
check_port 4000

# Setup environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your configuration"
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."

# Backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
else
    echo "✅ Backend dependencies installed"
fi

# Frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
else
    echo "✅ Frontend dependencies installed"
fi

# Create necessary directories
mkdir -p backend/uploads
mkdir -p backend/logs

# Start the applications
echo ""
echo "🚀 Starting applications..."
echo "================================"
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:3000"
echo "================================"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping applications..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup INT

# Start backend in background
echo "Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend server..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Show logs
echo ""
echo "📋 Applications are starting..."
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID