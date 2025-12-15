# Travel Application

Полнофункциональное приложение для управления путешествиями с фронтендом на Nuxt.js и бэкендом на NestJS.

## Стек технологий

### Backend
- NestJS (Node.js framework)
- PostgreSQL (база данных)
- Redis (кэширование)
- Prisma ORM
- JWT авторизация

### Frontend
- Nuxt 4 (Vue.js framework)
- TypeScript
- Pinia (state management)
- Nuxt UI

## Быстрый старт с Docker

### Предварительные требования
- Docker
- Docker Compose

### Запуск для разработки

1. Клонируйте репозиторий и перейдите в директорию проекта:
```bash
cd Travel
```

2. Создайте `.env` файл в корне проекта на основе `.env.example`:
```bash
cp .env.example .env
```

3. Отредактируйте `.env` файл и укажите необходимые значения (по умолчанию уже настроены базовые значения для разработки).

4. Запустите все сервисы:
```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL на порту `5433`
- Redis на порту `6379`
- Backend API на порту `3001`
- Frontend на порту `3000`

5. Проверьте статус контейнеров:
```bash
docker-compose ps
```

6. Просмотр логов:
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Доступ к приложению

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Nuxt DevTools**: http://localhost:24678

### Остановка сервисов

```bash
# Остановить все контейнеры
docker-compose down

# Остановить и удалить volumes (БД будет очищена!)
docker-compose down -v
```

## Разработка

### Hot Reload

В режиме разработки (docker-compose.yml) включен hot reload:
- Изменения в `travel-back/src` автоматически перезапускают backend
- Изменения в `travel-front/src` автоматически обновляют frontend

### Выполнение команд внутри контейнеров

```bash
# Backend
docker-compose exec backend npm run prisma:generate
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run lint

# Frontend
docker-compose exec frontend npm run build
docker-compose exec frontend npm run lint
```

### Миграции базы данных

```bash
# Создать миграцию
docker-compose exec backend npx prisma migrate dev --name migration_name

# Применить миграции
docker-compose exec backend npx prisma migrate deploy

# Prisma Studio (GUI для БД)
docker-compose exec backend npx prisma studio
```

## Production Build

Для production используйте отдельные Dockerfile (без суффикса .dev):

```bash
# Build образов
docker build -t travel-backend:prod -f travel-back/Dockerfile travel-back
docker build -t travel-frontend:prod -f travel-front/Dockerfile travel-front
```

## Структура проекта

```
Travel/
├── travel-back/          # Backend (NestJS)
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile        # Production
│   └── Dockerfile.dev    # Development
├── travel-front/         # Frontend (Nuxt)
│   ├── src/
│   ├── Dockerfile        # Production
│   └── Dockerfile.dev    # Development
├── docker-compose.yml    # Development environment
└── .env.example         # Environment variables template
```

## Переменные окружения

Основные переменные настраиваются в `.env` файле в корне проекта. См. `.env.example` для полного списка.

## Troubleshooting

### Порты уже заняты
Если порты 3000, 3001, 5433 или 6379 уже используются, измените их в `.env` файле.

### Проблемы с Prisma
Если возникают проблемы с Prisma Client:
```bash
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### Очистка и пересборка
```bash
# Остановить контейнеры
docker-compose down

# Удалить образы
docker-compose down --rmi all

# Пересобрать с нуля
docker-compose build --no-cache
docker-compose up -d
```
