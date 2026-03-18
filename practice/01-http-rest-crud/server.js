// =============================================================
// In-memory Tasks CRUD API
// Endpoints:
//   GET    /tasks        — список всех задач
//   GET    /tasks/:id    — одна задача
//   POST   /tasks        — создать задачу  → 201 + Location
//   PUT    /tasks/:id    — заменить задачу целиком
//   DELETE /tasks/:id    — удалить задачу  → 204
// =============================================================

const http = require("http");

// ---------- хранилище ----------
let tasks = [];
let nextId = 1;

// ---------- вспомогательные функции ----------

/** Отправить JSON-ответ */
function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(json),
  });
  res.end(json);
}

/** Стандартный формат ошибки */
function sendError(res, status, code, message) {
  send(res, status, { error: code, message });
}

/** Разобрать тело запроса и вернуть объект или null */
function parseBody(rawBody) {
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

/** Валидация поля title — возвращает строку с ошибкой или null */
function validateTitle(title) {
  if (title === undefined || title === null || title === "") {
    return "Field 'title' is required";
  }
  if (typeof title !== "string") {
    return "Field 'title' must be a string";
  }
  if (title.length > 200) {
    return "Field 'title' must not exceed 200 characters";
  }
  return null;
}

// ---------- маршрутизация ----------

const PORT = 8080;

const server = http.createServer((req, res) => {
  let rawBody = "";
  req.on("data", (chunk) => (rawBody += chunk));
  req.on("end", () => {
    const { method, url } = req;

    // /tasks
    if (url === "/tasks" || url === "/tasks/") {
      if (method === "GET") {
        return send(res, 200, tasks);
      }

      if (method === "POST") {
        const body = parseBody(rawBody);
        if (!body) return sendError(res, 400, "BAD_REQUEST", "Invalid JSON body");

        const titleError = validateTitle(body.title);
        if (titleError) return sendError(res, 400, "VALIDATION_ERROR", titleError);

        const task = {
          id: nextId++,
          title: body.title.trim(),
          done: false,
          createdAt: new Date().toISOString(),
        };
        tasks.push(task);
        res.setHeader("Location", `/tasks/${task.id}`);
        return send(res, 201, task);
      }

      return sendError(res, 405, "METHOD_NOT_ALLOWED", `Method ${method} not allowed`);
    }

    // /tasks/:id
    const match = url.match(/^\/tasks\/(\d+)\/?$/);
    if (match) {
      const id = parseInt(match[1], 10);
      const idx = tasks.findIndex((t) => t.id === id);

      if (method === "GET") {
        if (idx === -1) return sendError(res, 404, "NOT_FOUND", `Task ${id} not found`);
        return send(res, 200, tasks[idx]);
      }

      if (method === "PUT") {
        if (idx === -1) return sendError(res, 404, "NOT_FOUND", `Task ${id} not found`);

        const body = parseBody(rawBody);
        if (!body) return sendError(res, 400, "BAD_REQUEST", "Invalid JSON body");

        const titleError = validateTitle(body.title);
        if (titleError) return sendError(res, 400, "VALIDATION_ERROR", titleError);

        tasks[idx] = {
          id,
          title: body.title.trim(),
          done: typeof body.done === "boolean" ? body.done : tasks[idx].done,
          createdAt: tasks[idx].createdAt,
          updatedAt: new Date().toISOString(),
        };
        return send(res, 200, tasks[idx]);
      }

      if (method === "DELETE") {
        if (idx === -1) return sendError(res, 404, "NOT_FOUND", `Task ${id} not found`);
        tasks.splice(idx, 1);
        res.writeHead(204);
        return res.end();
      }

      return sendError(res, 405, "METHOD_NOT_ALLOWED", `Method ${method} not allowed`);
    }

    // неизвестный маршрут
    sendError(res, 404, "NOT_FOUND", `Route ${method} ${url} not found`);
  });
});

server.listen(PORT, () => {
  console.log(`Tasks API → http://127.0.0.1:${PORT}`);
  console.log("Routes:");
  console.log("  GET    /tasks");
  console.log("  GET    /tasks/:id");
  console.log("  POST   /tasks");
  console.log("  PUT    /tasks/:id");
  console.log("  DELETE /tasks/:id");
});