#!/bin/bash

echo "================================"
echo "Исправление проблемы с фронтендом"
echo "================================"
echo ""

cd travel-front

echo "Текущая версия Node: $(node -v)"
echo ""

# Проверка версии Node
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" != "20" ]; then
    echo "⚠️  ВНИМАНИЕ: Требуется Node.js 20, но у вас установлена версия $NODE_VERSION"
    echo ""
    echo "Установите Node.js 20:"
    echo "  brew install node@20"
    echo "  brew link node@20 --force --overwrite"
    echo ""
    echo "Или если используете nvm:"
    echo "  nvm install 20"
    echo "  nvm use 20"
    echo ""
    read -p "Продолжить установку с текущей версией? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "1. Удаление node_modules и package-lock.json..."
rm -rf node_modules package-lock.json .nuxt

echo "2. Установка зависимостей..."
npm install

echo ""
echo "================================"
echo "✅ Готово!"
echo "================================"
echo ""
echo "Запустите фронтенд:"
echo "  cd travel-front"
echo "  npm run dev"
echo ""
