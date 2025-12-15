#!/bin/bash

echo "================================"
echo "Travel App - Docker Setup"
echo "================================"
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Проверка Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен."
    exit 1
fi

echo "✅ Docker установлен: $(docker --version)"
echo "✅ Docker Compose установлен: $(docker-compose --version)"
echo ""

# Проверка .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден. Создаем из .env.example..."
    cp .env.example .env
    echo "✅ Файл .env создан. Проверьте настройки перед запуском."
fi

echo ""
echo "Запуск сервисов..."
echo ""

# Запуск Docker Compose
docker-compose up -d

echo ""
echo "================================"
echo "Проверка статуса контейнеров..."
echo "================================"
echo ""

sleep 3
docker-compose ps

echo ""
echo "================================"
echo "✅ Сервисы запущены!"
echo "================================"
echo ""
echo "📱 Frontend:       http://localhost:3000"
echo "🔧 Backend API:    http://localhost:3001"
echo "🗄️  PostgreSQL:     localhost:5433"
echo "💾 Redis:          localhost:6379"
echo "🛠️  Nuxt DevTools:  http://localhost:24678"
echo ""
echo "Для просмотра логов: make logs"
echo "Для остановки:       make down"
echo "Для помощи:          make help"
echo ""
