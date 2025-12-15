#!/bin/bash

echo "================================"
echo "Travel App - Docker Setup (Verbose)"
echo "================================"
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

echo "✅ Docker: $(docker --version)"
echo "✅ Docker Compose: $(docker-compose --version)"
echo ""

# Проверка места на диске
echo "Проверка места на диске:"
df -h / | tail -1
echo ""

# Проверка Docker
echo "Состояние Docker:"
docker info 2>&1 | grep -E "Server Version|Storage Driver|Docker Root Dir" || echo "⚠️  Docker может быть не запущен"
echo ""

# Остановим старые контейнеры если есть
echo "Остановка старых контейнеров..."
docker-compose down 2>&1
echo ""

# Очистка если нужно
echo "Очистка неиспользуемых образов..."
docker system prune -f 2>&1
echo ""

# Запуск с подробным выводом
echo "================================"
echo "Запуск сервисов (это может занять несколько минут)..."
echo "================================"
echo ""

docker-compose up -d --build 2>&1

echo ""
echo "================================"
echo "Статус контейнеров:"
echo "================================"
docker-compose ps

echo ""
echo "================================"
echo "Логи (последние 20 строк):"
echo "================================"
docker-compose logs --tail=20

echo ""
echo "================================"
echo "Готово!"
echo "================================"
