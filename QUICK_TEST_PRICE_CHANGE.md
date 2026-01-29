# 🚀 Быстрый тест изменения цены

## Вариант 1: Через браузер (самый простой)

### 1. Откройте страницу поиска
```
http://localhost:3000/hotels?cityId=106&dates=26.01.2026-27.01.2026&adultCount=1
```

### 2. Выберите отель и перейдите на страницу бронирования

### 3. Откройте DevTools (F12) → Network

### 4. Найдите запрос к `/offer/{propertyId}` и скопируйте `checksum` из ответа

### 5. Декодируйте checksum
- Откройте https://www.base64decode.org/
- Вставьте checksum → декодируйте
- Вы получите JSON вида:
```json
{"TotalAmountAfterTax":10000,"CurrencyCode":"RUB","StartPenaltyAmount":0}
```

### 6. Измените цену
- Измените `TotalAmountAfterTax` (например, с 10000 на 15000)
- Закодируйте обратно в Base64 на https://www.base64encode.org/

### 7. Подмените checksum в запросе
- Заполните форму бронирования
- Перед отправкой: в DevTools → Network найдите запрос `/reservation/quick-book`
- Используйте "Edit and Resend" или скопируйте как fetch и измените `roomStay.checksum`
- Отправьте запрос

### 8. Результат
✅ Должно появиться модальное окно с изменением цены!

---

## Вариант 2: Через скрипт (автоматизировано)

```bash
# Сделайте скрипт исполняемым
chmod +x test-price-change.sh

# Запустите (замените PROPERTY_ID на реальный ID отеля)
./test-price-change.sh PROPERTY_ID 106 2026-01-26 2026-01-27 1
```

**Где взять PROPERTY_ID?**
- Откройте страницу отеля: `http://localhost:3000/hotels/{propertyId}`
- Или из ответа API `/hotels` в поле `id`

---

## Вариант 3: Через Postman

1. **GET** `http://localhost:3001/offer/{propertyId}?cityId=106&dates=26.01.2026-27.01.2026&adultCount=1`
   - Скопируйте `checksum` из `offers[0]`

2. Декодируйте и измените цену (см. Вариант 1, шаги 5-6)

3. **POST** `http://localhost:3001/reservation/quick-book`
   ```json
   {
     "propertyId": "...",
     "roomStay": {
       "checksum": "ИЗМЕНЁННЫЙ_CHECKSUM",
       ...
     },
     "arrival": "2026-01-26",
     "departure": "2026-01-27",
     "guestsCount": { "adultCount": 1 },
     "customer": {
       "firstName": "Тест",
       "lastName": "Тестов",
       "phone": "+79991234567",
       "email": "test@example.com"
     },
     "guests": [{"firstName": "Тест", "lastName": "Тестов"}]
   }
   ```

---

## ✅ Что должно произойти

1. **Ответ API** должен содержать:
   ```json
   {
     "priceChanged": true,
     "originalPrice": 10000,
     "alternativePrice": 15000,
     "priceDifference": 5000,
     "currencyCode": "RUB",
     "alternativeToken": "...",
     "verify": { ... },
     "created": null
   }
   ```

2. **На фронтенде** появится модальное окно с:
   - Старой ценой (зачёркнутой)
   - Новой ценой (выделенной)
   - Разницей
   - Кнопками "Повторить поиск" и "Принять новые условия"

3. **При нажатии "Принять новые условия"**:
   - Отправится новый запрос с `acceptAlternative: true`
   - Бронирование создастся успешно

---

## 🐛 Если не работает

1. **Проверьте логи бэкенда:**
   ```
   [ReservationService] Price changed for property {id}: 10000 -> 15000 RUB
   ```

2. **Проверьте консоль браузера** на ошибки JavaScript

3. **Убедитесь, что:**
   - Base64 корректно закодирован (без пробелов)
   - JSON внутри checksum валидный
   - `alternativeToken` присутствует в ответе

---

## 📝 Примеры checksum

**Оригинальный:**
```
eyJUb3RhbEFtb3VudEFmdGVyVGF4IjoxMDAwMCwiQ3VycmVuY3lDb2RlIjoiUlVCIiwiU3RhcnRQZW5hbHR5QW1vdW50IjowfQ==
```

**Декодированный:**
```json
{"TotalAmountAfterTax":10000,"CurrencyCode":"RUB","StartPenaltyAmount":0}
```

**Изменённый (цена 15000):**
```json
{"TotalAmountAfterTax":15000,"CurrencyCode":"RUB","StartPenaltyAmount":0}
```

**Закодированный обратно:**
```
eyJUb3RhbEFtb3VudEFmdGVyVGF4IjoxNTAwMCwiQ3VycmVuY3lDb2RlIjoiUlVCIiwiU3RhcnRQZW5hbHR5QW1vdW50IjowfQ==
```
