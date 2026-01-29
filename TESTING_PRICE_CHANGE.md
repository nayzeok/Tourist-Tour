# Инструкция по тестированию сценария изменения цены/доступности

## Способ 1: Через изменение checksum (рекомендуется)

### Шаг 1: Получить checksum из ответа поиска

1. Откройте страницу поиска отелей: `http://localhost:3000/hotels?cityId=106&dates=26.01.2026-27.01.2026&adultCount=1`

2. Откройте DevTools (F12) → вкладка Network

3. Найдите запрос к `/hotels` или `/offer/{propertyId}`

4. В ответе найдите поле `checksum` в объекте `offers` или `roomStay`:

```json
{
  "offers": [
    {
      "roomTypeId": "...",
      "ratePlanId": "...",
      "checksum": "eyJUb3RhbEFtb3VudEFmdGVyVGF4IjoxMDAwMCwiQ3VycmVuY3lDb2RlIjoiUlVCIiwiU3RhcnRQZW5hbHR5QW1vdW50IjowfQ=="
    }
  ]
}
```

### Шаг 2: Декодировать checksum

1. Скопируйте значение `checksum` (без кавычек)

2. Откройте https://www.base64decode.org/ или используйте в терминале:

```bash
echo "ВАШ_CHECKSUM" | base64 -d
```

3. Вы получите JSON примерно такого вида:

```json
{
  "TotalAmountAfterTax": 10000,
  "CurrencyCode": "RUB",
  "StartPenaltyAmount": 0,
  "ChecksumWithExtras": 10000
}
```

### Шаг 3: Изменить цену

1. Измените значение `TotalAmountAfterTax` (например, с 10000 на 15000)

2. Также можно изменить `StartPenaltyAmount` (штраф за отмену)

3. Пример изменённого JSON:

```json
{
  "TotalAmountAfterTax": 15000,
  "CurrencyCode": "RUB",
  "StartPenaltyAmount": 500,
  "ChecksumWithExtras": 15000
}
```

### Шаг 4: Закодировать обратно в Base64

1. Используйте https://www.base64encode.org/ или в терминале:

```bash
echo '{"TotalAmountAfterTax":15000,"CurrencyCode":"RUB","StartPenaltyAmount":500,"ChecksumWithExtras":15000}' | base64
```

2. Скопируйте полученный Base64-код

### Шаг 5: Подменить checksum в запросе бронирования

#### Вариант A: Через DevTools (Network tab)

1. Откройте страницу бронирования: `http://localhost:3000/hotels/{propertyId}/booking?ratePlanId=...&roomTypeId=...&dates=...`

2. Заполните форму бронирования

3. Откройте DevTools → Network → включите "Preserve log"

4. Перед отправкой формы:
   - Найдите запрос к `/reservation/quick-book` в списке
   - Кликните правой кнопкой → "Copy" → "Copy as fetch"
   - Или используйте "Edit and Resend" (если доступно)

5. В теле запроса найдите `roomStay.checksum` и замените на ваш изменённый checksum

6. Отправьте запрос

#### Вариант B: Через curl (терминал)

```bash
curl -X POST http://localhost:3001/reservation/quick-book \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "ВАШ_PROPERTY_ID",
    "roomStay": {
      "propertyId": "ВАШ_PROPERTY_ID",
      "roomType": { "id": "ВАШ_ROOM_TYPE_ID" },
      "ratePlan": { "id": "ВАШ_RATE_PLAN_ID" },
      "checksum": "ИЗМЕНЁННЫЙ_CHECKSUM_BASE64",
      "currencyCode": "RUB",
      "total": {
        "priceAfterTax": 10000,
        "priceBeforeTax": 10000
      }
    },
    "arrival": "2026-01-26",
    "departure": "2026-01-27",
    "guestsCount": {
      "adultCount": 1
    },
    "customer": {
      "firstName": "Иван",
      "lastName": "Иванов",
      "phone": "+79991234567",
      "email": "test@example.com"
    },
    "guests": [
      {
        "firstName": "Иван",
        "lastName": "Иванов"
      }
    ]
  }'
```

### Шаг 6: Проверить результат

**Ожидаемое поведение:**

1. ✅ Запрос должен вернуть ответ с `priceChanged: true`

2. ✅ На фронтенде должно появиться модальное окно с:
   - Первоначальной ценой (зачёркнутой)
   - Новой ценой (выделенной)
   - Разницей в цене
   - Двумя кнопками: "Повторить поиск" и "Принять новые условия"

3. ✅ При нажатии "Принять новые условия":
   - Отправляется новый запрос с `acceptAlternative: true` и `alternativeToken`
   - Бронирование создаётся успешно

4. ✅ При нажатии "Повторить поиск":
   - Пользователь возвращается на страницу поиска отелей

---

## Способ 2: Через модификацию ответа API (для разработки)

Если у вас есть доступ к мок-серверу или вы можете временно изменить код:

1. В `reservation.service.ts` в методе `verifyBooking` можно временно добавить логику:

```typescript
const verifyRes = await this.verifyBooking(verifyPayload)

// ВРЕМЕННО ДЛЯ ТЕСТИРОВАНИЯ: симулируем изменение цены
if (Math.random() > 0.5) { // 50% вероятность
  verifyRes.booking = null
  verifyRes.alternativeBooking = {
    createBookingToken: 'test-token-' + Date.now(),
    // ... другие поля
  }
  verifyRes.warnings = [{
    code: 'PRICE_CHANGED',
    message: 'Цена изменилась во время бронирования'
  }]
}
```

2. Перезапустите бэкенд и попробуйте забронировать — примерно в 50% случаев появится модальное окно

---

## Способ 3: Через Postman/Insomnia

1. Создайте коллекцию запросов:

### Запрос 1: Поиск отелей
```
GET http://localhost:3001/hotels?cityId=106&dates=26.01.2026-27.01.2026&adultCount=1
```

### Запрос 2: Получить предложения отеля
```
GET http://localhost:3001/offer/{propertyId}?cityId=106&dates=26.01.2026-27.01.2026&adultCount=1
```

### Запрос 3: Бронирование (с оригинальным checksum)
```
POST http://localhost:3001/reservation/quick-book
Body: { ... с оригинальным checksum }
```

### Запрос 4: Бронирование (с изменённым checksum)
```
POST http://localhost:3001/reservation/quick-book
Body: { ... с изменённым checksum }
```

---

## Проверка логов

В логах бэкенда вы должны увидеть:

```
[ReservationService] Price changed for property {propertyId}: 10000 -> 15000 RUB
```

---

## Возможные проблемы

1. **Модальное окно не появляется:**
   - Проверьте, что `priceChanged: true` в ответе API
   - Проверьте консоль браузера на ошибки JavaScript
   - Убедитесь, что `alternativeToken` присутствует в ответе

2. **Checksum не валидируется:**
   - Убедитесь, что Base64 корректно закодирован (без пробелов, переносов строк)
   - Проверьте, что JSON внутри checksum валидный

3. **Ошибка при подтверждении:**
   - Убедитесь, что `alternativeToken` передаётся в запросе
   - Проверьте, что токен не истёк (если есть TTL)

---

## Быстрый тест через скрипт

Создайте файл `test-price-change.sh`:

```bash
#!/bin/bash

# 1. Получаем предложения
OFFER=$(curl -s "http://localhost:3001/offer/PROPERTY_ID?cityId=106&dates=26.01.2026-27.01.2026&adultCount=1")

# 2. Извлекаем checksum
CHECKSUM=$(echo $OFFER | jq -r '.offers[0].checksum')

# 3. Декодируем
DECODED=$(echo $CHECKSUM | base64 -d)
echo "Original checksum: $DECODED"

# 4. Изменяем цену (пример)
MODIFIED=$(echo $DECODED | jq '.TotalAmountAfterTax = 15000')

# 5. Кодируем обратно
NEW_CHECKSUM=$(echo $MODIFIED | base64 -w 0)

# 6. Отправляем запрос с изменённым checksum
curl -X POST http://localhost:3001/reservation/quick-book \
  -H "Content-Type: application/json" \
  -d "{
    \"propertyId\": \"PROPERTY_ID\",
    \"roomStay\": {
      \"checksum\": \"$NEW_CHECKSUM\",
      ...
    },
    ...
  }"
```

---

## Чек-лист тестирования

- [ ] Модальное окно появляется при изменении цены
- [ ] Отображается старая цена (зачёркнутая)
- [ ] Отображается новая цена (выделенная)
- [ ] Отображается разница в цене (красным/зелёным)
- [ ] Кнопка "Принять новые условия" работает
- [ ] Кнопка "Повторить поиск" возвращает на страницу поиска
- [ ] Бронирование создаётся успешно после подтверждения
- [ ] Предупреждения от API отображаются (если есть)
