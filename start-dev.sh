#!/bin/bash

# Free port 3000 and 8081 if occupied
echo "🧹 Eski süreçler ve portlar temizleniyor (Port 3000 & 8081)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Detect local IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1")

echo "🌐 Algılanan Yerel IP: $LOCAL_IP"

# Update valeria/.env with local IP
echo "EXPO_PUBLIC_API_URL=http://${LOCAL_IP}:3000/api" > ./valeria/.env

echo "🚀 Yerel Backend (Port 3000) başlatılıyor..."
(cd backend && npm run dev) &
BACKEND_PID=$!

sleep 3

echo "📲 Expo Dev Server (Port 8081) başlatılıyor..."
cd valeria && npx expo start --clear

# Cleanup backend on exit
kill -9 $BACKEND_PID 2>/dev/null || true
