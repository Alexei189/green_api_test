# green_api_test

Локальный запуск чата GREEN-API. Порядок вызовов описан в [APIreadme.md](APIreadme.md).

## Что нужно

- Node.js 18 или новее
- npm

## Запуск

В корне проекта:

```bash
npm install
npm run dev
```

`npm run dev` поднимает мок GREEN-API на [http://localhost:3001](http://localhost:3001) и интерфейс на [http://localhost:5173/](http://localhost:5173/).

Параметры инстанса (`apiUrl`, `idInstance`, `apiTokenInstance`) и номер телефона можно ввести в боковой панели и нажать «Сохранить». Эти значения хранятся в `localStorage` браузера. Если настройки уже сохранялись, укажите `apiUrl` как `http://localhost:3001`.

## Мок-сервер

Локальная замена GREEN-API: `server/index.js` (Express). Отдельный запуск:

```bash
npm run mock
```

Порт по умолчанию `3001`. Другой порт: `PORT=3002 npm run mock`. Проверка, что процесс жив: [http://localhost:3001/health](http://localhost:3001/health).

Мок принимает любой непустой `idInstance` и `apiTokenInstance`. У каждого инстанса своя очередь уведомлений. Повторяются те же пути, что у клиента:

| Метод | Путь | Поведение |
| --- | --- | --- |
| `POST` | `/waInstance{idInstance}/sendMessage/{apiTokenInstance}` | Тело `{ chatId, message }`. Ответ `{ idMessage }`. |
| `GET` | `/waInstance{idInstance}/receiveNotification/{apiTokenInstance}?receiveTimeout=5` | Long-poll одного уведомления. `receiveTimeout` ограничен 5–60 секундами. Если очередь пуста, ответ `200` с пустым телом. |
| `DELETE` | `/waInstance{idInstance}/deleteNotification/{apiTokenInstance}/{receiptId}` | Снимает уведомление с очереди. Ответ `{ result, reason }`. |

После `sendMessage` в очередь сразу попадает `outgoingAPIMessageReceived`, а примерно через 0,8 с — `incomingMessageReceived` с текстом `Эхо: …` и тем же `chatId`. Чат показывает этот входящий ответ.

Чтобы открыть только интерфейс, без мока: `npm run dev:web`.

## Переменные окружения

Файл `.env` необязателен. Если он есть, значения подставляются как начальные, пока в интерфейсе ничего не сохранено.

```bash
cp .env.example .env
```

```env
VITE_GREEN_API_URL=http://localhost:3001
VITE_GREEN_API_ID_INSTANCE=1101000001
VITE_GREEN_API_TOKEN_INSTANCE=mock-token
```

После изменения `.env` перезапустите `npm run dev`.

## Другие команды

```bash
npm run mock        # только мок GREEN-API
npm run dev:web     # только интерфейс
npm run typecheck   # проверка типов
npm run test:run    # тесты один раз
npm run build       # сборка в dist
npm run preview     # просмотр собранной версии
```
