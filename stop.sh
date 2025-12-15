#!/bin/bash

echo "================================"
echo "Travel App - Остановка сервисов"
echo "================================"
echo ""

docker-compose down

echo ""
echo "✅ Все сервисы остановлены"
echo ""
echo "Для полной очистки (включая volumes): make clean"
echo ""
