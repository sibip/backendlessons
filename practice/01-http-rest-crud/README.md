# 01 HTTP REST CRUD

## Часть 1 — Теория протокола

Прежде чем писать код, разберись как работает HTTP изнутри.

### HTTP-сессия

HTTP — протокол запрос/ответ поверх TCP. Посмотри на реальный обмен:

```bash
curl -v https://httpbin.org/get
```

В выводе `-v` видны:
- `>` — строки запроса (request line + headers)
- `<` — строки ответа (status line + headers)
- пустая строка — разделитель заголовков и тела

**Структура запроса:**
```
METHOD /path HTTP/1.1      ← стартовая строка
Host: example.com          ┐
Content-Type: application/json  │  заголовки
Authorization: Bearer xxx  ┘
                           ← пустая строка
{ "key": "value" }         ← тело (опционально)
```

**Структура ответа:**
```
HTTP/1.1 200 OK            ← статусная строка
Content-Type: application/json  ┐
Content-Length: 42         ┘  заголовки
                           ← пустая строка
{ "id": 1, ... }           ← тело
```

### Важные заголовки

| Заголовок | Назначение |
|-----------|------------|
| `Content-Type` | Формат тела (`application/json`, `text/html`, `multipart/form-data`) |
| `Authorization` | Токен доступа (`Bearer <jwt>` или `Basic <base64>`) |
| `Accept` | Какой формат ответа ожидает клиент |
| `Cache-Control` | Директивы кэширования (`no-cache`, `max-age=3600`) |
| `Set-Cookie` / `Cookie` | Управление сессией |
| `Access-Control-Allow-Origin` | CORS — разрешение для фронтенда |
| `Location` | URL созданного ресурса (в `201 Created`) |

### Анатомия URL

```
https://api.example.com:443/tasks/42?sort=asc&page=1#section
  │        │              │   │         │              │
scheme   host            port path      query        fragment
```

- **path** — иерархический идентификатор ресурса; только `[A-Za-z0-9._~:@!$&'()*+,;=-]` без кодирования
- **query** — параметры фильтрации/пагинации; пробелы, `&`, `=`, кириллица кодируются через percent-encoding: `hello world` → `hello%20world`
- **fragment** (`#`) — обрабатывается только браузером, на сервер не попадает

### Base64 — зачем нужен

Base64 переводит произвольные байты в набор из 64 ASCII-символов `[A-Za-z0-9+/=]`. Нужен там, где канал или формат поддерживает только текст:

```bash
# Пример: Basic Auth — "user:password" -> base64 (Node.js)
node -e "console.log(Buffer.from('user:password').toString('base64'))"
# dXNlcjpwYXNzd29yZA==

# В заголовке
Authorization: Basic dXNlcjpwYXNzd29yZA==

# Обратная сторона: легко декодировать (Node.js)
node -e "console.log(Buffer.from('dXNlcjpwYXNzd29yZA==', 'base64').toString())"
# user:password
```

**Где встречается base64 в backend:**
- `Authorization: Basic` — передача логин:пароль
- JWT (`eyJ...`) — каждая из трёх частей это base64url (без `+/`, вместо них `-_`)
- Передача бинарных данных (изображения, файлы) внутри JSON
- Encoded-данные в куках

> Base64 — это **кодирование**, не шифрование. Декодируется мгновенно без ключа.

**Percent-encoding vs Base64:**
- Percent-encoding (`%20`, `%D0%BF`) — для URL, заменяет недопустимые символы
- Base64 — для тела/заголовков, переводит байты в текст

---

## Часть 2 — Практика CRUD

### Цель
Собрать базовый API с корректной работой HTTP-методов, кодов ответа и валидации.

### Блок 0 — Ручной HTTP через Node.js

1. Создай `server.js`:

```js
const http = require("http");

const server = http.createServer((req, res) => {
   let body = "";
   req.on("data", (chunk) => (body += chunk));
   req.on("end", () => {
      console.log("---- REQUEST ----");
      console.log(req.method, req.url, "HTTP/" + req.httpVersion);
      console.log(req.headers);
      console.log("body:", body || "<empty>");
      console.log("-----------------");

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true, method: req.method, url: req.url }));
   });
});

server.listen(8080, () => {
   console.log("Server: http://127.0.0.1:8080");
});
```

2. Запусти сервер:

```bash
node server.js
```

3. Создай `manual-http-client.js`:

```js
const net = require("net");
const readline = require("readline");

const socket = net.createConnection({ host: "127.0.0.1", port: 8080 }, () => {
   console.log("Connected to 127.0.0.1:8080");
   console.log("Type HTTP lines manually");
   console.log("/end -> send empty line");
   console.log("/quit -> close client");
});

socket.on("data", (data) => process.stdout.write(data.toString()));
socket.on("end", () => console.log("\nConnection closed by server"));
socket.on("error", (err) => console.error("Socket error:", err.message));

const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout,
   terminal: true,
});

rl.on("line", (line) => {
   if (line === "/quit") {
      socket.end();
      rl.close();
      return;
   }
   if (line === "/end") {
      socket.write("\r\n");
      return;
   }
   socket.write(line + "\r\n");
});
```

4. Запусти клиент во втором терминале:

```bash
node manual-http-client.js
```

5. Введи вручную `GET`:

```http
GET /hello HTTP/1.1
Host: 127.0.0.1:8080
Connection: close
/end
```

6. Введи вручную `POST`:

```http
POST /tasks HTTP/1.1
Host: 127.0.0.1:8080
Content-Type: application/json
Content-Length: 13
Connection: close
/end
{"x":"test"}
```

7. Зафиксируй наблюдения в `notes.md`: какие заголовки реально дошли, что попало в `body`, и как меняется ответ при ошибке в `Content-Length`.

### Задания

1. **Посмотри HTTP в живую:**
   ```bash
   curl -v https://httpbin.org/get
   curl -v -X POST https://httpbin.org/post -H "Content-Type: application/json" -d '{"test":1}'
   ```
   Найди в выводе: стартовую строку, заголовки, пустую строку, тело.

2. **Подними сервис с сущностью `tasks`** (in-memory, без БД):
   - `GET /tasks` — список
   - `GET /tasks/:id` — одна задача (404 если не найдена)
   - `POST /tasks` — создать (201 + Location)
   - `PUT /tasks/:id` — заменить целиком
   - `DELETE /tasks/:id` — удалить (204)

3. **Добавь валидацию:** обязательное поле `title`, максимум 200 символов → `400` с понятным сообщением.

4. **Единый формат ошибок:**
   ```json
   { "error": "NOT_FOUND", "message": "Task 99 not found" }
   ```

5. **Протестируй в Postman или curl** все сценарии: успех, 404, невалидный запрос.

### Результат
- Рабочий CRUD API.
- Коллекция запросов (`postman_collection.json`) или файл `requests.http`.
- Ответь письменно (в `notes.md` в этой папке) на вопросы:
  - Что ты увидел в `curl -v`? Опиши каждую часть ответа.
  - Почему `POST /tasks` возвращает `201`, а не `200`?
  - Зачем в `Authorization: Basic` используется base64?

