#!/bin/bash

# MicroTerm Quick Start Script
# This script helps you start both frontend and backend

set -e

echo "=================================="
echo "   MicroTerm Quick Start"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -d "microterm" ] || [ ! -d "data-factory" ]; then
    echo "❌ Error: Please run this script from the microTerm root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

if ! command_exists python3; then
    echo "❌ Python 3 not found. Please install Python 3.9+ from https://python.org"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ Python: $(python3 --version)"
echo ""

# Check if dependencies are installed
echo "Checking dependencies..."

if [ ! -d "microterm/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd microterm
    npm install
    cd ..
fi

if [ ! -d "data-factory/venv" ]; then
    echo "📦 Setting up Python virtual environment..."
    cd data-factory
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    cd ..
fi

echo "✅ Dependencies installed"
echo ""

# Check if database exists
if [ ! -f "data-factory/data/financial_data.db" ]; then
    echo "🗄️  Database not found. Seeding initial data..."
    cd data-factory
    source venv/bin/activate
    python workers/sec_worker.py
    python workers/blockchain_worker.py
    python workers/news_worker.py
    python workers/market_worker.py
    deactivate
    cd ..
    echo "✅ Database seeded"
else
    echo "✅ Database exists"
fi

echo ""
echo "=================================="
echo "   Starting MicroTerm"
echo "=================================="
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down MicroTerm..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend workers
echo "🐍 Starting Python data workers..."
cd data-factory
source venv/bin/activate
python main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
deactivate
cd ..

# Wait a bit for backend to start
sleep 2

# Start frontend
echo "⚛️  Starting Next.js frontend..."
cd microterm
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "=================================="
echo "   ✅ MicroTerm is running!"
echo "=================================="
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: Running in background"
echo ""
echo "📋 Logs:"
echo "   - Frontend: logs/frontend.log"
echo "   - Backend: logs/backend.log"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running and show logs
mkdir -p logs
tail -f logs/frontend.log logs/backend.log

