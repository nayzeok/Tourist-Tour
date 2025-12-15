.PHONY: help up down restart logs build clean ps backend-logs frontend-logs db-logs migrate prisma-studio

help: ## Показать эту справку
	@echo "Доступные команды:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Запустить все сервисы
	docker-compose up -d

down: ## Остановить все сервисы
	docker-compose down

restart: ## Перезапустить все сервисы
	docker-compose restart

logs: ## Показать логи всех сервисов
	docker-compose logs -f

backend-logs: ## Показать логи бэкенда
	docker-compose logs -f backend

frontend-logs: ## Показать логи фронтенда
	docker-compose logs -f frontend

db-logs: ## Показать логи PostgreSQL
	docker-compose logs -f postgres

build: ## Пересобрать все образы
	docker-compose build --no-cache

clean: ## Остановить и удалить все контейнеры и volumes
	docker-compose down -v

ps: ## Показать статус контейнеров
	docker-compose ps

migrate: ## Применить миграции базы данных
	docker-compose exec backend npx prisma migrate deploy

migrate-dev: ## Создать новую миграцию (dev)
	docker-compose exec backend npx prisma migrate dev

prisma-studio: ## Открыть Prisma Studio
	docker-compose exec backend npx prisma studio

prisma-generate: ## Сгенерировать Prisma Client
	docker-compose exec backend npx prisma generate

backend-shell: ## Зайти в shell бэкенда
	docker-compose exec backend sh

frontend-shell: ## Зайти в shell фронтенда
	docker-compose exec frontend sh

db-shell: ## Зайти в psql
	docker-compose exec postgres psql -U user -d travel
