# 02 Async Node.js и Event Loop

## Цель
Понять однопоточную модель Node.js: Event Loop, фазы, микро- и макро-задачи, асинхронные примитивы и встроенные инструменты — EventEmitter и Streams.

## Практика
- [ ] 1. Нарисуй (или опиши текстом) схему Event Loop с фазами: timers → pending callbacks → idle → poll → check → close.
- [ ] 2. Напиши сниппет, демонстрирующий порядок выполнения: `setTimeout`, `setImmediate`, `Promise.then`, `process.nextTick`.
- [ ] 3. Реализуй функцию с `Promise`, затем перепиши её через `async/await`.
- [ ] 4. Обработай параллельные асинхронные операции: `Promise.all`, `Promise.allSettled`, `Promise.race`.
- [ ] 5. Реализуй паттерн «очередь задач»: ограничь параллелизм — не более N одновременных промисов.
- [ ] 6. Создай простой `EventEmitter`: события `data` и `error`, подписчики, отписка.
- [ ] 7. Реализуй Readable Stream и pipe его в Writable: прочитай большой файл построчно без загрузки в память целиком.

## Вопросы для самопроверки
- [ ] 1. Что такое Event Loop и почему Node.js называют однопоточным?
- [ ] 2. В чём разница между `process.nextTick` и `Promise.then`?
- [ ] 3. Когда использовать `Promise.all`, а когда `Promise.allSettled`?
- [ ] 4. Что такое EventEmitter? Назови типичные случаи использования.
- [ ] 5. Что такое Stream и зачем он нужен для больших данных?
- [ ] 6. Что такое backpressure в Streams?
- [ ] 7. Чем `async/await` отличается от raw Promise-цепочек?
- [ ] 8. Что произойдёт, если не обрабатывать `unhandledRejection`?
- [ ] 9. Как CPU-intensive задача блокирует Event Loop и как это решать?

## Файлы
| Файл | Описание |
|------|----------|
| `event-loop-demo.js` | Демонстрация порядка выполнения фаз |
| `async-patterns.js` | Promise.all / race / allSettled |
| `limited-concurrency.js` | Очередь с ограничением параллелизма |
| `emitter.js` | Кастомный EventEmitter |
| `streams-demo.js` | Readable → pipe → Writable |

## Полезные ссылки
- [Node.js Event Loop официальная документация](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick)
- [Stream API](https://nodejs.org/api/stream.html)
- [EventEmitter API](https://nodejs.org/api/events.html)
