import { computed, ref } from 'vue'
import type { CountryCode, LocaleCode, StandProfile } from '../config/types'
import type { UserType } from '../config/users'
import { standLogLimit, standLogUrl } from '../config/logging'
import { testProfile } from '../config/profiles'
import type { StandVariant } from './useStand'

/**
 * Прохождение сценария: секундомер и журнал.
 *
 * Замеряем ровно то, что сравниваем, — сколько времени человек тратит от
 * открытия чекаута до создания заказа. Секундомер стартует, когда открылся
 * чекаут (то есть выбраны все три оси), и останавливается по клику
 * «Перейти к оплате». Выбор страны, профиль и выбор версии в замер не
 * входят: это подготовка стенда, а не сценарий.
 *
 * Смена любой оси на ходу начинает замер заново — это уже другой кейс,
 * и склеивать его с предыдущим нельзя.
 */

export interface StandRun {
  id: string
  /** Начало прохождения, ISO. Дата и время старта нужны в отчёте. */
  startedAt: string
  finishedAt: string
  durationMs: number
  country: CountryCode
  user: UserType
  variant: StandVariant
  locale: LocaleCode
  firstName: string
  lastName: string
  email: string
  phone: string
  orderNumber: string
  /** Прогон заполнен кнопкой «Тест-данные» — не настоящий респондент. */
  isTest: boolean
  /** Строка доехала до Google-таблицы. */
  sent: boolean
}

const STORAGE_KEY = 'cc3-stand-runs'

function readRuns(): StandRun[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    return raw ? (JSON.parse(raw) as StandRun[]) : []
  } catch {
    return []
  }
}

function writeRuns(value: StandRun[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Хранилище недоступно — журнал живёт до перезагрузки. Ронять из-за
    // этого прохождение нельзя: замер важнее его сохранности.
  }
}

// Журнал и текущий замер общие на всё приложение: секундомер запускает
// корневой компонент, останавливает кнопка в подвале, а показывает журнал
// третий экран.
const runs = ref<StandRun[]>(readRuns())
const startedAt = ref<number>()
const finishedRun = ref<StandRun>()

/** Ключ текущего кейса — по нему видно, что оси переключили на ходу. */
const runKey = ref<string>()

function orderNumber(at: number): string {
  return `CC-${at.toString(36).toUpperCase().slice(-6)}`
}

/**
 * Отправка строки в Google-таблицу.
 *
 * text/plain, а не application/json: с ним запрос уходит без предварительного
 * OPTIONS, который веб-приложение Apps Script не обрабатывает. Тело всё равно
 * остаётся JSON — скрипт разбирает его сам.
 *
 * keepalive: прохождение заканчивается на экране благодарности, и вкладку
 * нередко закрывают сразу — без него запрос не успевает уйти.
 */
async function sendRun(run: StandRun): Promise<boolean> {
  if (!standLogUrl) {
    return false
  }

  try {
    await fetch(standLogUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(run),
      keepalive: true,
    })

    return true
  } catch {
    return false
  }
}

function persist() {
  writeRuns(runs.value)
}

export function useStandRun() {
  /**
   * Открылся чекаут. Повторный вызов с тем же кейсом ничего не делает —
   * перерисовка компонента не должна обнулять секундомер.
   */
  function beginRun(key: string) {
    if (runKey.value === key && startedAt.value !== undefined) {
      return
    }

    runKey.value = key
    startedAt.value = Date.now()
    finishedRun.value = undefined
  }

  function resetRun() {
    runKey.value = undefined
    startedAt.value = undefined
    finishedRun.value = undefined
  }

  /**
   * Заказ создан. Строка сначала попадает в журнал браузера и только потом
   * уходит в таблицу: отправка может не дойти, а прохождение к этому моменту
   * уже состоялось, и терять его нельзя.
   */
  async function finishRun(context: {
    country: CountryCode
    user: UserType
    variant: StandVariant
    locale: LocaleCode
    profile: StandProfile
  }) {
    const finishedAtMs = Date.now()
    const startedAtMs = startedAt.value ?? finishedAtMs

    const run: StandRun = {
      id: `run-${finishedAtMs}`,
      startedAt: new Date(startedAtMs).toISOString(),
      finishedAt: new Date(finishedAtMs).toISOString(),
      durationMs: finishedAtMs - startedAtMs,
      country: context.country,
      user: context.user,
      variant: context.variant,
      locale: context.locale,
      firstName: context.profile.firstName,
      lastName: context.profile.lastName,
      email: context.profile.email,
      phone: context.profile.phone,
      orderNumber: orderNumber(finishedAtMs),
      isTest: context.profile.email === testProfile.email,
      sent: false,
    }

    runs.value = [run, ...runs.value].slice(0, standLogLimit)
    finishedRun.value = run
    persist()

    if (await sendRun(run)) {
      markSent(run.id)
    }
  }

  function markSent(id: string) {
    runs.value = runs.value.map((item) => (item.id === id ? { ...item, sent: true } : item))

    if (finishedRun.value?.id === id) {
      finishedRun.value = { ...finishedRun.value, sent: true }
    }

    persist()
  }

  /** Повторная отправка строки, которая не доехала с первого раза. */
  async function resend(id: string) {
    const run = runs.value.find((item) => item.id === id)

    if (run && (await sendRun(run))) {
      markSent(id)
    }
  }

  function clearRuns() {
    runs.value = []
    persist()
  }

  const isFinished = computed(() => Boolean(finishedRun.value))

  return {
    runs: computed(() => runs.value),
    finishedRun: computed(() => finishedRun.value),
    isFinished,
    isLogEnabled: computed(() => Boolean(standLogUrl)),
    beginRun,
    finishRun,
    resetRun,
    resend,
    clearRuns,
  }
}

/** Длительность в виде «2 мин 14 с» — читается быстрее, чем 134 000 мс. */
export function formatDuration(ms: number, minuteLabel: string, secondLabel: string): string {
  const total = Math.round(ms / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60

  return minutes > 0
    ? `${minutes} ${minuteLabel} ${seconds} ${secondLabel}`
    : `${seconds} ${secondLabel}`
}
