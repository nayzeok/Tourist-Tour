# Устранение проблем

## Проблема: Docker Desktop поврежден

### Симптомы:
- `input/output error`
- `read-only file system`
- `unable to get image`

### Решение:

1. **Полная очистка Docker Desktop:**

```bash
# Остановите Docker Desktop через GUI

# Удалите все данные Docker (ВНИМАНИЕ: удалит все контейнеры и образы!)
rm -rf ~/Library/Containers/com.docker.docker
rm -rf ~/Library/Application\ Support/Docker\ Desktop
rm -rf ~/Library/Group\ Containers/group.com.docker

# Перезапустите Docker Desktop
```

2. **Или через Docker Desktop GUI:**
   - Откройте Docker Desktop
   - Settings → Troubleshoot → Clean / Purge data
   - Нажмите "Reset to factory defaults"
   - Перезапустите Docker Desktop

3. **После перезапуска:**
```bash
cd /Users/user/Documents/Travel
./start.sh
```

## Проблема: Фронтенд не запускается (oxc-parser)

### Симптомы:
- `Cannot find native binding`
- `Cannot find module '@oxc-parser/binding-darwin-arm64'`

### Решение:

```bash
cd travel-front

# Удалите node_modules и package-lock.json
rm -rf node_modules package-lock.json

# Переустановите зависимости
npm install

# Запустите dev сервер
npm run dev
```

## Запуск БЕЗ Docker (если Docker не работает)

### 1. Установите PostgreSQL локально:

```bash
# Через Homebrew
brew install postgresql@16
brew services start postgresql@16

# Создайте базу данных
createdb travel
```

### 2. Установите Redis локально:

```bash
# Через Homebrew
brew install redis
brew services start redis
```

### 3. Обновите .env файлы:

**travel-back/.env:**
```env
PG_HOST=127.0.0.1
PG_PORT=5432
DATABASE_URL=postgresql://user:SdjfsfjDAasdj14h124@127.0.0.1:5432/travel?schema=sample

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

**travel-front/.env:**
```env
BASE_URL="http://localhost:3001"
```

### 4. Запустите сервисы:

**Terminal 1 - Backend:**
```bash
cd travel-back
npm install
npx prisma migrate deploy
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd travel-front
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Проблема: Node.js версия

Если возникают проблемы с версией Node.js, установите Node.js 20:

```bash
# Через Homebrew
brew install node@20
brew link node@20 --force --overwrite

# Проверьте версию
node -v  # должно показать v20.x.x
```

## Полезные команды для диагностики

```bash
# Проверка Docker
docker version
docker ps -a
docker images
docker system df

# Проверка портов
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5433  # PostgreSQL
lsof -i :6379  # Redis

# Логи Docker
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend
```
