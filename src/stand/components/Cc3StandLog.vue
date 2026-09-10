<script setup lang="ts">
import { computed } from 'vue'

import { routeHref, useStand } from '../composables/useStand'
import { formatDuration, useStandRun } from '../composables/useStandRun'
import type { StandRun } from '../composables/useStandRun'

/**
 * Журнал прохождений — служебный экран модератора, `#/log`.
 *
 * Стенд лежит на статике и писать в файл репозитория не может, поэтому
 * прохождения копятся в браузере, а наружу выходят двумя путями: строкой в
 * Google-таблицу сразу после заказа (если задан адрес) и выгрузкой CSV
 * отсюда. CSV — не запасной вариант, а основной способ приложить сырые
 * данные к отчёту: файл кладётся в `logs/` репозитория.
 *
 * Экран всегда по-русски: он для нас, а не для респондента, и переводить
 * его на пять языков — тратить словари на то, чего никто не увидит.
 */
const { isLogEnabled, runs, resend, clearRuns } = useStandRun()
useStand()

const total = computed(() => runs.value.length)

const testCount = computed(() => runs.value.filter((run) => run.isTest).length)

const unsentCount = computed(() => runs.value.filter((run) => !run.sent).length)

/**
 * Среднее время считается только по не-тестовым прогонам: наши прогоны
 * кнопкой «Тест-данные» короче любого настоящего и утянут среднее вниз.
 */
const averageLabel = computed(() => {
  const real = runs.value.filter((run) => !run.isTest)

  if (real.length === 0) {
    return '—'
  }

  const sum = real.reduce((acc, run) => acc + run.durationMs, 0)

  return formatDuration(sum / real.length, 'мин', 'с')
})

const indexHref = computed(() => routeHref())

const rows = computed(() =>
  runs.value.map((run) => ({
    id: run.id,
    startedAt: new Date(run.startedAt).toLocaleString('ru-RU'),
    duration: formatDuration(run.durationMs, 'мин', 'с'),
    caseLabel: `${run.country} / ${run.user} / ${run.variant}`,
    name: `${run.firstName} ${run.lastName}`,
    email: run.email,
    phone: run.phone,
    order: run.orderNumber,
    isTest: run.isTest,
    sent: run.sent,
  })),
)

const CSV_COLUMNS: { key: keyof StandRun; title: string }[] = [
  { key: 'startedAt', title: 'Старт' },
  { key: 'finishedAt', title: 'Финиш' },
  { key: 'durationMs', title: 'Длительность, мс' },
  { key: 'country', title: 'Страна' },
  { key: 'user', title: 'Тип пользователя' },
  { key: 'variant', title: 'Версия' },
  { key: 'locale', title: 'Язык' },
  { key: 'firstName', title: 'Имя' },
  { key: 'lastName', title: 'Фамилия' },
  { key: 'email', title: 'Почта' },
  { key: 'phone', title: 'Телефон' },
  { key: 'orderNumber', title: 'Номер заказа' },
  { key: 'isTest', title: 'Тестовый прогон' },
  { key: 'sent', title: 'Отправлено в таблицу' },
]

function csvCell(value: string | number | boolean): string {
  return `"${String(value).replace(/"/g, '""')}"`
}

/**
 * Выгрузка CSV.
 *
 * Разделитель — точка с запятой, а не запятая: Excel с русской локалью
 * читает файл с запятыми как одну колонку. BOM в начале — по той же
 * причине, без него кириллица открывается кракозябрами.
 */
function exportCsv() {
  const header = CSV_COLUMNS.map((column) => csvCell(column.title)).join(';')
  const lines = runs.value.map((run) =>
    CSV_COLUMNS.map((column) => csvCell(run[column.key])).join(';'),
  )
  const csv = `﻿${[header, ...lines].join('\r\n')}`

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')

  link.href = url
  link.download = `stand-runs-${stamp}.csv`
  link.click()

  URL.revokeObjectURL(url)
}

function clear() {
  if (window.confirm('Удалить все записи журнала? Выгруженные CSV останутся.')) {
    clearRuns()
  }
}
</script>

<template>
  <div class="cc3-stand-log">
    <header class="cc3-stand-log__header">
      <h1 class="cc3-stand-log__title">Журнал прохождений</h1>
      <a :href="indexHref" class="cc3-stand-log__back">На вход стенда</a>
    </header>

    <dl class="cc3-stand-log__stats">
      <div class="cc3-stand-log__stat">
        <dt class="cc3-stand-log__stat-label">Всего прогонов</dt>
        <dd class="cc3-stand-log__stat-value">{{ total }}</dd>
      </div>
      <div class="cc3-stand-log__stat">
        <dt class="cc3-stand-log__stat-label">Из них тестовых</dt>
        <dd class="cc3-stand-log__stat-value">{{ testCount }}</dd>
      </div>
      <div class="cc3-stand-log__stat">
        <dt class="cc3-stand-log__stat-label">Среднее время</dt>
        <dd class="cc3-stand-log__stat-value">{{ averageLabel }}</dd>
      </div>
      <div v-if="isLogEnabled" class="cc3-stand-log__stat">
        <dt class="cc3-stand-log__stat-label">Не ушло в таблицу</dt>
        <dd class="cc3-stand-log__stat-value">{{ unsentCount }}</dd>
      </div>
    </dl>

    <p v-if="!isLogEnabled" class="cc3-stand-log__notice">
      Отправка в Google-таблицу не настроена: журнал живёт только в этом
      браузере. Выгрузите CSV перед тем, как чистить данные сайта.
    </p>

    <div class="cc3-stand-log__actions">
      <button type="button" class="cc3-stand-log__button" @click="exportCsv">
        Выгрузить CSV
      </button>
      <button type="button" class="cc3-stand-log__button cc3-stand-log__button--ghost" @click="clear">
        Очистить журнал
      </button>
    </div>

    <p v-if="total === 0" class="cc3-stand-log__empty">
      Пока пусто. Пройдите сценарий до кнопки создания заказа — строка появится здесь.
    </p>

    <div v-else class="cc3-stand-log__scroll">
      <table class="cc3-stand-log__table">
        <thead>
          <tr>
            <th>Старт</th>
            <th>Время</th>
            <th>Кейс</th>
            <th>Респондент</th>
            <th>Контакты</th>
            <th>Заказ</th>
            <th v-if="isLogEnabled">Таблица</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" :class="{ 'cc3-stand-log__row--test': row.isTest }">
            <td>{{ row.startedAt }}</td>
            <td>{{ row.duration }}</td>
            <td>{{ row.caseLabel }}</td>
            <td>{{ row.name }}</td>
            <td>
              {{ row.email }}
              <br />
              {{ row.phone }}
            </td>
            <td>{{ row.order }}</td>
            <td v-if="isLogEnabled">
              <span v-if="row.sent" class="cc3-stand-log__sent">отправлено</span>
              <button v-else type="button" class="cc3-stand-log__resend" @click="resend(row.id)">
                отправить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss">
.cc3-stand-log {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  margin: 0 auto;
  padding: var(--st-global-distance-space-inset-2xl)
    var(--st-global-distance-space-inset-xl);
  max-width: 1100px;

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-md);
  }

  &__title {
    margin: 0;

    @include font('heading-xs');
  }

  &__back {
    @include font('label-sm');

    color: var(--st-content-foreground-color-primary-secondary);
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-global-distance-space-inset-2xl);

    margin: 0;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-xs);
  }

  &__stat-label {
    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__stat-value {
    margin: 0;

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__notice,
  &__empty {
    margin: 0;
    padding: var(--st-global-distance-space-inset-xl);

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
    background-color: var(--st-content-background-color-neutral-subtle);
    border-radius: var(--st-global-radius-lg);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-global-distance-space-inset-md);
  }

  &__button {
    padding: var(--st-global-distance-space-inset-md)
      var(--st-global-distance-space-inset-2xl);

    font-family: inherit;

    @include font('label-md');

    color: var(--st-action-foreground-color-onprimary-normal);
    background-color: var(--st-action-background-color-positive-normal);
    border: none;
    border-radius: var(--st-global-radius-md);
    cursor: pointer;

    &--ghost {
      color: var(--st-content-foreground-color-neutral-secondary);
      background-color: transparent;
      border: 1px solid var(--st-content-border-color-neutral-secondary);
    }
  }

  // Таблица шире телефона по определению — прокручивается она, а не страница.
  &__scroll {
    overflow-x: auto;
  }

  &__table {
    width: 100%;

    @include font('body-sm');

    border-collapse: collapse;
    white-space: nowrap;

    th,
    td {
      padding: var(--st-global-distance-space-inset-sm)
        var(--st-global-distance-space-inset-md);

      text-align: left;
      border-bottom: 1px solid var(--st-content-border-color-neutral-implicit);
    }

    th {
      @include font('label-sm');

      color: var(--st-content-foreground-color-neutral-tetriary);
    }
  }

  // Тестовые прогоны приглушены: в отчёт идут не они.
  &__row--test td {
    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__sent {
    color: var(--st-action-foreground-color-positive-normal);
  }

  &__resend {
    padding: 0;

    font-family: inherit;

    @include font('body-sm');

    color: var(--st-content-foreground-color-negative-primary);
    background: none;
    border: none;
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
