#!/bin/bash

# Скрипт для тестирования сценария изменения цены при бронировании
# Использование: ./test-price-change.sh PROPERTY_ID CITY_ID ARRIVAL DEPARTURE ADULT_COUNT

set -e

API_URL="${API_URL:-http://localhost:3001}"
PROPERTY_ID="${1:-}"
CITY_ID="${2:-106}"
ARRIVAL="${3:-2026-01-26}"
DEPARTURE="${4:-2026-01-27}"
ADULT_COUNT="${5:-1}"

if [ -z "$PROPERTY_ID" ]; then
  echo "❌ Ошибка: не указан PROPERTY_ID"
  echo "Использование: $0 PROPERTY_ID [CITY_ID] [ARRIVAL] [DEPARTURE] [ADULT_COUNT]"
  echo "Пример: $0 12345 106 2026-01-26 2026-01-27 1"
  exit 1
fi

echo "🔍 Получаю предложения для отеля $PROPERTY_ID..."
echo ""

# Получаем предложения
OFFER_RESPONSE=$(curl -s "${API_URL}/offer/${PROPERTY_ID}?cityId=${CITY_ID}&dates=$(date -d "$ARRIVAL" +%d.%m.%Y)-$(date -d "$DEPARTURE" +%d.%m.%Y)&adultCount=${ADULT_COUNT}")

# Проверяем, что получили данные
if echo "$OFFER_RESPONSE" | jq -e '.offers[0]' > /dev/null 2>&1; then
  echo "✅ Предложения получены"
else
  echo "❌ Ошибка: не удалось получить предложения"
  echo "$OFFER_RESPONSE" | jq '.'
  exit 1
fi

# Извлекаем первый оффер
OFFER=$(echo "$OFFER_RESPONSE" | jq '.offers[0]')
ORIGINAL_CHECKSUM=$(echo "$OFFER" | jq -r '.checksum // empty')
RATE_PLAN_ID=$(echo "$OFFER" | jq -r '.ratePlanId')
ROOM_TYPE_ID=$(echo "$OFFER" | jq -r '.roomTypeId')
ORIGINAL_PRICE=$(echo "$OFFER" | jq -r '.price.total // .price.perNight * 1')

if [ -z "$ORIGINAL_CHECKSUM" ]; then
  echo "❌ Ошибка: checksum не найден в ответе"
  exit 1
fi

echo "📋 Оригинальный checksum: ${ORIGINAL_CHECKSUM:0:50}..."
echo "💰 Оригинальная цена: $ORIGINAL_PRICE ₽"
echo ""

# Декодируем checksum
echo "🔓 Декодирую checksum..."
DECODED_CHECKSUM=$(echo "$ORIGINAL_CHECKSUM" | base64 -d 2>/dev/null || echo "$ORIGINAL_CHECKSUM" | base64 -D 2>/dev/null)

if [ -z "$DECODED_CHECKSUM" ]; then
  echo "❌ Ошибка: не удалось декодировать checksum"
  exit 1
fi

echo "📄 Декодированный JSON:"
echo "$DECODED_CHECKSUM" | jq '.' 2>/dev/null || echo "$DECODED_CHECKSUM"
echo ""

# Изменяем цену (увеличиваем на 50%)
MODIFIED_CHECKSUM_JSON=$(echo "$DECODED_CHECKSUM" | jq --arg newPrice "$(echo "$ORIGINAL_PRICE * 1.5" | bc)" '.TotalAmountAfterTax = ($newPrice | tonumber) | .ChecksumWithExtras = ($newPrice | tonumber)')

echo "✏️  Изменённый JSON (цена увеличена на 50%):"
echo "$MODIFIED_CHECKSUM_JSON" | jq '.'
echo ""

# Кодируем обратно
NEW_CHECKSUM=$(echo "$MODIFIED_CHECKSUM_JSON" | base64 -w 0 2>/dev/null || echo "$MODIFIED_CHECKSUM_JSON" | base64)

echo "🔒 Новый checksum: ${NEW_CHECKSUM:0:50}..."
echo ""

# Формируем payload для бронирования
BOOKING_PAYLOAD=$(cat <<EOF
{
  "propertyId": "$PROPERTY_ID",
  "roomStay": {
    "propertyId": "$PROPERTY_ID",
    "roomType": {
      "id": "$ROOM_TYPE_ID"
    },
    "ratePlan": {
      "id": "$RATE_PLAN_ID"
    },
    "checksum": "$NEW_CHECKSUM",
    "currencyCode": "RUB",
    "total": {
      "priceAfterTax": $ORIGINAL_PRICE,
      "priceBeforeTax": $ORIGINAL_PRICE
    }
  },
  "arrival": "$ARRIVAL",
  "departure": "$DEPARTURE",
  "guestsCount": {
    "adultCount": $ADULT_COUNT
  },
  "customer": {
    "firstName": "Тест",
    "lastName": "Тестов",
    "phone": "+79991234567",
    "email": "test@example.com"
  },
  "guests": [
    {
      "firstName": "Тест",
      "lastName": "Тестов"
    }
  ]
}
EOF
)

echo "📤 Отправляю запрос на бронирование с изменённым checksum..."
echo ""

# Отправляем запрос
RESPONSE=$(curl -s -X POST "${API_URL}/reservation/quick-book" \
  -H "Content-Type: application/json" \
  -d "$BOOKING_PAYLOAD")

# Проверяем результат
if echo "$RESPONSE" | jq -e '.priceChanged == true' > /dev/null 2>&1; then
  echo "✅ УСПЕХ! Обнаружено изменение цены"
  echo ""
  echo "📊 Детали:"
  echo "$RESPONSE" | jq '{
    priceChanged: .priceChanged,
    originalPrice: .originalPrice,
    alternativePrice: .alternativePrice,
    priceDifference: .priceDifference,
    currencyCode: .currencyCode,
    hasAlternativeToken: (.alternativeToken != null)
  }'
  echo ""
  echo "🎉 Модальное окно должно появиться на фронтенде!"
  echo ""
  echo "Полный ответ:"
  echo "$RESPONSE" | jq '.'
else
  echo "⚠️  Изменение цены не обнаружено"
  echo ""
  echo "Ответ API:"
  echo "$RESPONSE" | jq '.'
fi
