#!/bin/bash

echo "🚀 Starting DAOgram..."

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "Please create backend/.env with your TELEGRAM_BOT_TOKEN"
    echo "Example:"
    echo "TELEGRAM_BOT_TOKEN=your_bot_token_here"
    echo "MASTER_SEED_PHRASE=term client despair will cheese jar weapon adapt forum story ranch where sign cup juice burden armor mom impact shoulder cloud mercy advance write"
    echo "PORT=3001"
    echo "SSL_KEY=./ssl/key.pem"
    echo "SSL_CERT=./ssl/cert.pem"
    exit 1
fi

# Start backend (integrated bot + server)
echo "📡 Starting backend services..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start mini-app
echo "🌐 Starting mini-app..."
cd ../daogram-mini-app
npm run dev &
MINIAPP_PID=$!

echo "✅ DAOgram is starting up!"
echo "📱 Mini-app will be available at: https://daogram.commonwealthsovereignfoundation.org"
echo "🔌 Socket server running on: https://commonwealthsovereignfoundation.org"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait 