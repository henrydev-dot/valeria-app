#!/bin/bash

# Trap Ctrl+C (SIGINT) and exit signals to clean up background processes
cleanup() {
    echo ""
    echo "🛑 Süreçler kapatılıyor..."
    if [ -n "$BACKEND_PID" ]; then
        kill -9 $BACKEND_PID 2>/dev/null || true
    fi
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:8081 | xargs kill -9 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo "🧹 Eski süreçler ve portlar temizleniyor (Port 3000 & 8081)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Detect local IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en1 2>/dev/null)
fi
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="127.0.0.1"
fi

# Set API URL (default to live production domain https://api.valeria.today/api)
API_URL=${1:-"https://api.valeria.today/api"}
if [ "$1" = "local" ]; then
    API_URL="http://${LOCAL_IP}:3000/api"
    echo "🚀 Yerel Backend (Port 3000) başlatılıyor..."
    (cd backend && npm run dev) &
    BACKEND_PID=$!
    sleep 3
else
    echo "🌍 Canlı API kullanılacak: $API_URL"
fi

echo "EXPO_PUBLIC_API_URL=${API_URL}" > ./valeria/.env

echo "📲 Expo Dev Server (Port 8081) başlatılıyor..."
echo "📱 Telefonunuzdaki Expo Go uygulaması ile QR kodu okutabilirsiniz!"
cd valeria && npx expo start --clear
