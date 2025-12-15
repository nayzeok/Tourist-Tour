# 🚀 Начало работы с Travel App

## ⚠️ Важно: У вас проблемы с Docker Desktop!

Docker Desktop поврежден и требует полного сброса. Есть 2 варианта:

---

## 🐳 Вариант 1: Запуск С Docker (рекомендуется)

### Шаг 1: Исправьте Docker Desktop

**Через GUI (проще):**
1. Откройте Docker Desktop
2. Settings (⚙️) → Troubleshoot
3. Нажмите **"Reset to factory defaults"**
4. Дождитесь перезапуска Docker Desktop
5. Убедитесь что Docker запущен (иконка в трее)

**Или через терминал:**
```bash
# Остановите Docker Desktop через GUI

# Удалите все данные (ВНИМАНИЕ: удалит все контейнеры!)
rm -rf ~/Library/Containers/com.docker.docker
rm -rf ~/Library/Application\ Support/Docker\ Desktop
rm -rf ~/Library/Group\ Containers/group.com.docker

# Запустите Docker Desktop снова через GUI
```

### Шаг 2: Запустите проект

```bash
cd /Users/user/Documents/Travel
./start.sh
```

**Готово!** Откройте:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 💻 Вариант 2: Запуск БЕЗ Docker (быстрый старт)

Если не хотите чинить Docker - можно запустить без него:

### Шаг 1: Установите зависимости

```bash
# PostgreSQL
brew install postgresql@16
brew services start postgresql@16
createdb travel

# Redis
brew install redis
brew services start redis

# Node.js 20 (у вас сейчас v23!)
brew install node@20
brew link node@20 --force --overwrite
node -v  # должно показать v20.x.x
```

### Шаг 2: Настройте .env файлы

**travel-back/.env** - уже настроен, просто проверьте:
```env
PG_HOST=127.0.0.1
PG_PORT=5432
REDIS_HOST=127.0.0.1
```

**travel-front/.env** - измените на:
```env
BASE_URL="http://localhost:3001"
```

### Шаг 3: Запустите Backend

```bash
cd /Users/user/Documents/Travel/travel-back
npm install
npx prisma migrate deploy
npm run start:dev
```

Backend запустится на http://localhost:3001

### Шаг 4: Запустите Frontend (в новом терминале)

```bash
cd /Users/user/Documents/Travel/travel-front

# Исправьте проблему с oxc-parser
rm -rf node_modules package-lock.json .nuxt
npm install

# Запустите
npm run dev
```

Frontend запустится на http://localhost:3000

---

## 🔧 Решение проблем

### Проблема: "Cannot find native binding" (фронтенд)

```bash
cd /Users/user/Documents/Travel
./fix-frontend.sh
```

### Проблема: Порт уже занят

```bash
# Проверьте что запущено на портах
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Убейте процесс
kill -9 <PID>
```

### Проблема: Docker не работает

Смотрите **Вариант 2** выше или файл `TROUBLESHOOTING.md`

---

## 📚 Дополнительная документация

- `README.md` - полная документация проекта
- `QUICKSTART.md` - быстрый старт с Docker
- `TROUBLESHOOTING.md` - детальное решение проблем
- `Makefile` - полезные команды (`make help`)

---

## ✅ Проверка что все работает

1. **Backend:** http://localhost:3001
2. **Frontend:** http://localhost:3000
3. **PostgreSQL:** `psql -U user -d travel` (порт 5432 или 5433)
4. **Redis:** `redis-cli ping` → должен ответить `PONG`

---

## 🎯 Следующие шаги

После запуска:
- Фронтенд доступен на http://localhost:3000
- API документация (Swagger) на http://localhost:3001/api
- Prisma Studio: `cd travel-back && npx prisma studio`

**Удачи!** 🚀
