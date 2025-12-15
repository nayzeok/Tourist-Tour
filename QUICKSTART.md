# Быстрый старт

## Запуск проекта в Docker (рекомендуется)

### 1. Убедитесь что Docker запущен
```bash
docker --version
docker-compose --version
```

### 2. Запустите все сервисы
```bash
# Используя docker-compose
docker-compose up -d

# Или используя Makefile
make up
```

### 3. Проверьте статус
```bash
# Используя docker-compose
docker-compose ps

# Или используя Makefile
make ps
```

Все контейнеры должны быть в статусе `Up`:
- `postgres-travel` (PostgreSQL)
- `travel_redis` (Redis)
- `travel-backend` (NestJS API)
- `travel-frontend` (Nuxt.js)

### 4. Просмотр логов
```bash
# Все логи
make logs

# Только бэкенд
make backend-logs

# Только фронтенд
make frontend-logs
```

### 5. Откройте приложение
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Nuxt DevTools: http://localhost:24678

## Полезные команды

### Управление контейнерами
```bash
make up           # Запустить все сервисы
make down         # Остановить все сервисы
make restart      # Перезапустить все сервисы
make ps           # Статус контейнеров
make logs         # Логи всех сервисов
```

### Работа с базой данных
```bash
make migrate          # Применить миграции
make migrate-dev      # Создать новую миграцию
make prisma-studio    # Открыть Prisma Studio (GUI для БД)
make db-shell         # Зайти в PostgreSQL shell
```

### Работа с кодом
```bash
make backend-shell    # Зайти в shell бэкенда
make frontend-shell   # Зайти в shell фронтенда
```

### Очистка
```bash
make clean        # Остановить и удалить все (включая volumes!)
make build        # Пересобрать образы с нуля
```

## Структура портов

| Сервис | Порт |
|--------|------|
| Frontend | 3000 |
| Backend API | 3001 |
| PostgreSQL | 5433 |
| Redis | 6379 |
| Nuxt DevTools | 24678 |

## Hot Reload

В режиме разработки включен автоматический перезапуск:
- **Backend**: изменения в `travel-back/src/` автоматически перезапускают сервер
- **Frontend**: изменения в `travel-front/src/` автоматически обновляют браузер

## Первый запуск

При первом запуске:
1. Docker скачает все необходимые образы (Node.js, PostgreSQL, Redis)
2. Установит зависимости для фронтенда и бэкенда
3. Применит миграции базы данных
4. Запустит все сервисы

Это может занять 5-10 минут в зависимости от скорости интернета.

## Troubleshooting

### Порты заняты
Если порты уже используются, отредактируйте `.env` файл:
```env
PORT=3001        # Backend порт
PG_PORT=5433     # PostgreSQL порт
REDIS_PORT=6379  # Redis порт
```

### Ошибки Prisma
```bash
make prisma-generate
docker-compose restart backend
```

### Полная очистка и пересборка
```bash
make clean
make build
make up
```

### Проверка логов при ошибках
```bash
# Проверьте логи конкретного сервиса
make backend-logs
make frontend-logs
make db-logs
```

## Разработка без Docker (опционально)

Если хотите запустить без Docker:

### Backend
```bash
cd travel-back
npm install
npm run start:dev
```

### Frontend
```bash
cd travel-front
npm install
npm run dev
```

Не забудьте также запустить PostgreSQL и Redis локально или через Docker.
