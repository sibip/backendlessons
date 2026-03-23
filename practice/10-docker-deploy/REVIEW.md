# Review: 10 Docker and Deploy

Контрольные вопросы, по которым я буду оценивать Dockerfile, docker-compose и CI/CD.

---

## Dockerfile

- [ ] Используется multi-stage build: отдельный `builder` stage и финальный `production` stage?
- [ ] Базовый образ зафиксирован по точной версии: `node:20.11-alpine` (не просто `node:latest`)?
- [ ] `npm ci` используется вместо `npm install` для воспроизводимой сборки?
- [ ] В production stage копируются только `node_modules` и собранный код — не исходники и не `devDependencies`?
- [ ] Приложение запускается от непривилегированного пользователя (`USER node`), не от `root`?
- [ ] `COPY package*.json ./` идёт до `COPY . .` чтобы кэш слоя с зависимостями не инвалидировался при изменении кода?
- [ ] `EXPOSE` указывает правильный порт приложения?
- [ ] `CMD` использует exec-форму (`["node", "server.js"]`), не shell-форму (`CMD node server.js`)?

## .dockerignore

- [ ] `node_modules/` в `.dockerignore`?
- [ ] `.git/` в `.dockerignore`?
- [ ] `.env` и `*.log` в `.dockerignore`?
- [ ] Размер контекст-сборки разумный: `docker build` не копирует сотни MB?

## docker-compose

- [ ] Все три сервиса описаны: `api`, `db` (postgres), `redis`?
- [ ] Сервисы связаны через именованную docker-сеть (не `links`)?
- [ ] `db` сервис имеет volume для персистентных данных?
- [ ] `healthcheck` настроен для `db` и `redis`?
- [ ] `api` сервис имеет `depends_on` с условием `service_healthy` (не просто `depends_on: db`)?
- [ ] Порты: внешний порт пробрасывается только для `api` — не для `db` в production-конфигурации?
- [ ] Все секреты передаются через `env_file: .env` или `environment:` из переменных — не хардкодом?

## Переменные окружения и секреты

- [ ] `.env` не закоммичен; есть `.env.example` без реальных значений?
- [ ] Нет `JWT_SECRET`, `DB_PASSWORD` внутри `docker-compose.yml` в открытом виде?
- [ ] Разные конфигурации для `development` и `production` (или хотя бы объяснено, как разделить)?

## GitHub Actions / CI

- [ ] Pipeline содержит минимум три шага: lint → test → build?
- [ ] Тесты запускаются с тестовой БД (service container или in-memory мок)?
- [ ] Секреты хранятся в GitHub Secrets репозитория, не в файлах?
- [ ] Pipeline падает при ошибке теста или линтера — нет `continue-on-error: true` без обоснования?
- [ ] Build-шаг тегирует docker-образ: `latest` + SHA коммита?

## Запуск и воспроизводимость

- [ ] `docker compose up --build` поднимает всё с нуля без ручных шагов?
- [ ] `README` содержит команды для локального запуска?
- [ ] `docker compose down -v` корректно останавливает и удаляет тома?
