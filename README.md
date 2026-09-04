# Coral Club — локальная разработка

Проект под дизайн-систему Coral Club.
Справочник компонентов и токенов: <https://storybook.coralclub.online>

## Стек

Тот же, что и в дизайн-системе:

| Что | Версия |
| --- | --- |
| Node.js | 24.19.0 (зафиксирована в `.nvmrc`) |
| Vue | 3.5 — только Composition API + `<script setup>` |
| Vite | 6 |
| TypeScript | 5.7 |
| Стили | SCSS (`sass-embedded`). TailwindCSS запрещён |
| Storybook | 8.6 (`@storybook/vue3-vite`) |

## Первый запуск

Node установлен через nvm. В новом терминале он подхватывается автоматически
(строки добавлены в `~/.zshrc`). Если `node` не найден:

```bash
source ~/.zshrc && nvm use
```

Установка зависимостей:

```bash
npm install
```

## Команды

| Команда | Что делает |
| --- | --- |
| `npm run dev` | Dev-сервер Vite → <http://127.0.0.1:5173> |
| `npm run storybook` | Локальный Storybook → <http://localhost:6006> |
| `npm run build` | Проверка типов + продакшен-сборка в `dist/` |
| `npm run preview` | Локальный просмотр собранного `dist/` |
| `npm run type-check` | Только проверка типов (`vue-tsc`) |
| `npm run lint` | ESLint с автофиксом |
| `npm run lint:style` | Stylelint по `.vue` и `.scss` с автофиксом |
| `npm run format` | Prettier по `src/` |

## Структура

```
.storybook/          конфигурация локального Storybook
design-references/   визуальные референсы дизайна (скрины, шрифты, цвета) — см. ниже
src/
  components/        компоненты приложения (Cc3*)
  stories/           стори для компонентов приложения
  styles/
    core.scss        единая точка входа: брейкпоинты, миксины, палитра
    _breakpoints.scss
    _media.scss      миксин mediaMinWidth
    _palette.scss    миксины paletteColor / paletteBackground  ← заглушка
    _tokens.fallback.scss  временные значения токенов --st-*    ← заглушка
    index.scss       глобальные стили, подключается в main.ts
  App.vue
  main.ts
```

`src/styles/core.scss` подключается автоматически во все `<style lang="scss">`
через `vite.config.ts`, поэтому писать `@use` в компонентах не нужно.

## ⚠️ Что осталось подключить: пакет UI дизайн-системы

Компоненты `C2*` (C2Checkbox, C2Button, …) и настоящие токены `--st-*` живут в
**приватном** npm-пакете — в публичном npm его нет, из Storybook имя пакета не
определяется. Пока он не подключён, в проекте работают локальные заглушки.

Что нужно запросить у тимлида:

1. точное имя пакета;
2. адрес приватного npm-реестра;
3. токен доступа.

Дальше:

1. Заполнить `.npmrc` по шаблону внутри файла. **Токен вписывать не в `.npmrc`**
   (он в git), а в переменную окружения `CORAL_NPM_TOKEN`.
2. `npm install <имя-пакета>`
3. Раскомментировать `@forward '<пакет-ui>/styles';` в `src/styles/core.scss`
   и **удалить** `_palette.scss` и `_tokens.fallback.scss` вместе с их
   `@forward` / `@use` — настоящие миксины и токены придут из пакета.
4. Подключить плагин в `src/main.ts` (`app.use(Ui)`) — см. комментарий в файле.

## Дизайн-референсы

Скриншоты макетов, шрифтов, цветов и отдельных блоков — в
[design-references/](design-references/README.md). Это только справочный
материал для правки стилей: он не участвует в сборке и не должен влиять на
архитектуру или логику проекта. Правила работы с этой папкой — в её README
(на утверждении).

## Правила разработки

Полный свод — в [CLAUDE.md](CLAUDE.md).
Первоисточник — Storybook → Руководство → Рекомендации.
