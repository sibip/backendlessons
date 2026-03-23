# 04 Git и командная работа

## Цель
Уверенно работать с Git в командном контексте: ветки, история, разрешение конфликтов, npm-зависимости.

## Практика
- [ ] 1. Создай feature-ветку, внеси несколько коммитов с осмысленными сообщениями (Conventional Commits), слей в `main` через Pull Request.
- [ ] 2. Намеренно создай merge-конфликт и разреши его вручную.
- [ ] 3. Попробуй `git rebase` в интерактивном режиме: squash нескольких «wip»-коммитов в один.
- [ ] 4. Исследуй `git bisect`: найди «сломанный» коммит в истории.
- [ ] 5. Настрой `.npmrc` + `.nvmrc` для фиксации версий Node.js и реестра.
- [ ] 6. Разберись с `package.json`: scripts, engines, dependencies vs devDependencies vs peerDependencies.

## Вопросы для самопроверки
- [ ] 1. В чём разница между `merge` и `rebase`?
- [ ] 2. Что делает `git stash` и когда он нужен?
- [ ] 3. Как откатить последний коммит, не потеряв изменения в рабочей директории?
- [ ] 4. Что такое `HEAD` и `detached HEAD`?
- [ ] 5. В чём разница между `dependencies`, `devDependencies` и `peerDependencies`?

## Файлы
| Файл | Описание |
|------|----------|
| `.nvmrc` | Фиксация версии Node.js |
| `.npmrc` | Настройки npm-реестра |
| `COMMIT_CONVENTION.md` | Шпаргалка по Conventional Commits |

## Полезные ссылки
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git rebase interactive](https://git-scm.com/docs/git-rebase#_interactive_mode)
- [npm package.json docs](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
