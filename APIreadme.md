# Порядок работы API

Чат говорит с GREEN-API по HTTP. Локально те же запросы принимает мок `server/index.js`. Клиент собирает адрес в `src/api/client.ts`:

```text
{apiUrl}/waInstance{idInstance}/{метод}/{apiTokenInstance}
```

`apiUrl`, `idInstance` и `apiTokenInstance` берутся из боковой панели (они сохраняются в `localStorage`). Пока в панели ничего не сохранено, подставляются значения из `.env`. Номер телефона перед отправкой превращается в `chatId` вида `79991234567@c.us`.

Пока заполнены все три параметра инстанса, интерфейс крутит цикл получения. Отправка идёт отдельно, по кнопке «Отправить».

## 1. Отправка сообщения

Пользователь вводит текст. Клиент вызывает `sendMessage` (`src/api/sendMessage.ts`):

```http
POST /waInstance{idInstance}/sendMessage/{apiTokenInstance}
Content-Type: application/json

{
  "chatId": "79991234567@c.us",
  "message": "привет"
}
```

Необязательные поля того же тела: `typingTime`, `quotedMessageId`.

Успешный ответ:

```json
{ "idMessage": "..." }
```

Чат сразу показывает этот текст как исходящее сообщение с полученным `idMessage`. Пустой ответ или статус не 2xx считаются ошибкой и показываются в окне чата.

На моке после этого в очередь инстанса попадают два уведомления:

1. сразу — `outgoingAPIMessageReceived` с тем же текстом;
2. примерно через 0,8 с — `incomingMessageReceived` с текстом `Эхо: …` и тем же `chatId`.

## 2. Получение одного уведомления

Цикл в `src/hooks/useNotificationPolling.ts` вызывает `receiveNotification` (`src/api/receiveNotification.ts`). В чате таймаут ожидания — 20 секунд:

```http
GET /waInstance{idInstance}/receiveNotification/{apiTokenInstance}?receiveTimeout=20
```

Сервер держит запрос, пока в очереди не появится уведомление, но не дольше `receiveTimeout` (мок ограничивает значение диапазоном 5–60 секунд). Очередь общая на инстанс и отдаёт уведомления по одному, в порядке поступления.

Если за время ожидания ничего нет, ответ `200` с пустым телом. Клиент считает это нормальным результатом и сразу запрашивает следующее уведомление.

Если уведомление есть:

```json
{
  "receiptId": 1,
  "body": {
    "typeWebhook": "incomingMessageReceived",
    "timestamp": 1792565613,
    "idMessage": "...",
    "senderData": {
      "chatId": "79991234567@c.us",
      "sender": "79991234567@c.us",
      "senderName": "Mock"
    },
    "messageData": {
      "typeMessage": "textMessage",
      "textMessageData": { "textMessage": "Эхо: привет" }
    }
  }
}
```

## 3. Обработка и удаление

Клиент смотрит на `body.typeWebhook`:

- `incomingMessageReceived` с текстом (`textMessage` или `extendedTextMessage`) и `chatId` активного чата попадает в список сообщений как входящее;
- остальные типы, включая `outgoingAPIMessageReceived`, в ленту не добавляются.

В обоих случаях следом вызывается `deleteNotification` (`src/api/deleteNotification.ts`). Пока уведомление не удалено, следующее `receiveNotification` его не отдаст: очередь отдаёт только голову.

```http
DELETE /waInstance{idInstance}/deleteNotification/{apiTokenInstance}/{receiptId}
```

Ответ:

```json
{ "result": true, "reason": "" }
```

Повторное удаление того же `receiptId` на моке возвращает `{ "result": false, "reason": "ReceiptId not found" }`.

После удаления цикл сразу возвращается к шагу 2.

## 4. Ошибка цикла

Сетевая ошибка или ответ не 2xx останавливают текущий запрос. Статус в шапке чата становится «ошибка получения», текст ошибки виден над лентой. Через 3 секунды цикл начинается снова. Смена настроек инстанса или уход со страницы обрывают текущий запрос.

## Сводка

```text
сохранить apiUrl, idInstance, apiTokenInstance
        │
        ├─ отправка:  POST sendMessage → показать исходящее
        │
        └─ пока настройки заданы:
              GET receiveNotification
                    │ пусто → снова GET
                    │ уведомление
                    ├─ входящий текст этого чата → показать в ленте
                    └─ DELETE deleteNotification/{receiptId}
                          → снова GET
```
