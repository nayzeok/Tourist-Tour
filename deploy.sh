#!/bin/bash
set -e

echo "=== Деплой Tourist Tours ==="

# Остановить и пересобрать контейнеры
docker compose -f docker-compose.prod.yml --env-file .env.prod down

# Пулл последних изменений
git pull origin main

# Пересобрать и запустить
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

echo "=== Готово! Контейнеры запущены ==="
docker compose -f docker-compose.prod.yml ps
