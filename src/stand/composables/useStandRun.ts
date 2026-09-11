import { computed, ref } from 'vue'
import type { CountryCode, LocaleCode, StandProfile } from '../config/types'
import type { UserType } from '../config/users'
import { standLogAttempts, standLogUrl } from '../config/logging'
import { testProfile } from '../config/profiles'
import type { StandVariant } from './useStand'

/**
 * Прохождение сценария: секундомер и отправка строки в журнал.
 *
 * Замеряем ровно то, что сравниваем, — сколько времени человек тратит от
 * открытия чекаута до создания заказа. Секундомер стартует, когда открылся
 * чекаут (то есть выбраны все три оси), и останавливается по клику
 * «Перейти к оплате». Выбор страны, профиль и выбор версии в замер не
 * входят: это подготовка стенда, а не сценарий.
 *
 * Смена любой оси на ходу начинает замер заново — это уже другой кейс,
 * и склеивать его с предыдущим нельзя.
 *
 * Журнал живёт только в Google-таблице. В браузере не остаётся ничего:
 * прогоны со всех устройств лежат в одном месте, и нечего забыть выгрузить.
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
}

/** Что с отправкой строки прямо сейчас. */
export type SendState = 'idle' | 'sending' | 'sent' | 'failed'

// Замер общий на всё приложение: секундомер запускает корневой компонент,
// останавливает кнопка в подвале, а результат показывает третий экран.
const startedAt = ref<number>()
const finishedRun = ref<StandRun>()
const sendState = ref<SendState>('idle')

/** Ключ текущего кейса — по нему видно, что оси переключили на ходу. */
const runKey = ref<string>()

function orderNumber(at: number): string {
  return `CC-${at.toString(36).toUpperCase().slice(-6)}`
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
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
 *
 * Попыток несколько, с растущей паузой: строку негде продублировать, а
 * секундной потери сети в переговорке достаточно, чтобы прогон пропал.
 * Дальше первой попытки Apps Script может ответить дублем — это лучше,
 * чем потерянное прохождение: дубли в таблице видно по времени старта.
 */
async function sendRun(run: StandRun): Promise<boolean> {
  if (!standLogUrl) {
    return false
  }

  for (let attempt = 0; attempt < standLogAttempts; attempt += 1) {
    if (attempt > 0) {
      await wait(attempt * 1500)
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
      // Следующая попытка. Ответ не читаем: у веб-приложения Apps Script
      // ответ приходит после редиректа, и отличить «не дошло» от «дошло,
      // но ответ не прочитался» всё равно нельзя.
    }
  }

  return false
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
    sendState.value = 'idle'
  }

  function resetRun() {
    runKey.value = undefined
    startedAt.value = undefined
    finishedRun.value = undefined
    sendState.value = 'idle'
  }

  /**
   * Заказ создан. Экран благодарности показывается сразу, не дожидаясь
   * ответа таблицы: прохождение к этому моменту уже состоялось, и держать
   * человека перед пустым экраном из-за сети незачем.
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
    }

    finishedRun.value = run
    sendState.value = 'sending'
    sendState.value = (await sendRun(run)) ? 'sent' : 'failed'
  }

  /** Повторная отправка руками — с экрана благодарности. */
  async function retrySend() {
    const run = finishedRun.value

    if (!run || sendState.value === 'sending') {
      return
    }

    sendState.value = 'sending'
    sendState.value = (await sendRun(run)) ? 'sent' : 'failed'
  }

  /**
   * Строка для ручного переноса, если отправка так и не прошла.
   * Разделитель — табуляция: так она вставляется в таблицу колонками.
   */
  const runAsText = computed(() => {
    const run = finishedRun.value

    if (!run) {
      return ''
    }

    return [
      run.startedAt,
      run.finishedAt,
      run.durationMs,
      Math.round(run.durationMs / 1000),
      run.country,
      run.user,
      run.variant,
      run.locale,
      run.firstName,
      run.lastName,
      run.email,
      run.phone,
      run.orderNumber,
      run.isTest ? 'да' : 'нет',
    ].join('\t')
  })

  return {
    finishedRun: computed(() => finishedRun.value),
    isFinished: computed(() => Boolean(finishedRun.value)),
    sendState: computed(() => sendState.value),
    runAsText,
    beginRun,
    finishRun,
    resetRun,
    retrySend,
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
