import type { CountryCode } from './types'

/**
 * Слоты доставки: когда курьер приедет.
 *
 * Два правила, из-за которых это конфиг, а не вёрстка.
 *
 * Первое: даты считаются от сегодняшнего дня. Раньше они стояли строками в
 * словаре — «28 авг, пт», «29 авг, сб», — и к октябрю чекаут предлагал
 * respondentу доставку в прошлом. Та же причина, по которой сроки
 * американской доставки уже считаются от даты прогона (см.
 * useCourierVariants): стенд живёт месяцами.
 *
 * Второе: набор зависит от выбранного способа. У экспресса в описании
 * сказано «в день заказа», а в датах не было сегодняшнего дня вовсе —
 * только «Завтра» и два дня после. Респондент выбирал доставку сегодня и
 * тут же назначал её на завтра.
 *
 * Слоты есть только на российском рынке: в Европе и США курьер приезжает в
 * интервал, который человек не выбирает.
 */
export interface DeliverySlotChip {
  value: string
  label: string
}

export interface DeliverySlots {
  dates: DeliverySlotChip[]
  times: DeliverySlotChip[]
}

type Translate = (key: string, params?: Record<string, string>) => string

/**
 * Окна обычного курьера: рабочий день, разбитый на три части по четыре
 * часа. Было два почти одинаковых окна до полуночи — «12:00 — 23:00» и
 * «13:00 — 00:00», — между которыми нечего выбирать.
 */
const STANDARD_WINDOWS: [number, number][] = [
  [10, 14],
  [14, 18],
  [18, 22],
]

/** Окна экспресса: остаток того же дня, короче обычных. */
const EXPRESS_WINDOWS: [number, number][] = [
  [14, 17],
  [17, 20],
  [20, 23],
]

/** На сколько дней вперёд можно назначить обычного курьера. */
const STANDARD_DAYS = 5

/**
 * Запас до начала окна. Окно, которое начинается через двадцать минут,
 * предлагать нечестно — курьер не успеет.
 */
const LEAD_HOURS = 2

function pad(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

function toChip([start, end]: [number, number]): DeliverySlotChip {
  return { value: `${start}-${end}`, label: `${pad(start)} — ${pad(end)}` }
}

function windowChips(windows: [number, number][], from?: Date): DeliverySlotChip[] {
  if (!from) {
    return windows.map(toChip)
  }

  const hour = from.getHours()
  const ahead = windows.filter(([start]) => start >= hour + LEAD_HOURS)

  if (ahead.length > 0) {
    return ahead.map(toChip)
  }

  // Поздний вечер: с запасом не остаётся ничего. Берём окна, которые ещё
  // не закончились, и только если нет и таких — весь набор. Пустой ряд
  // читается как поломка, а стенд не служба доставки: спорить с ним
  // о часах респонденту незачем.
  const running = windows.filter(([, end]) => end > hour)

  return (running.length > 0 ? running : windows).map(toChip)
}

/**
 * Русские сокращения Intl приходят с точкой — «13 окт.», «ср». В чипсе она
 * лишняя: подписи короткие, и точка читается как конец предложения посреди
 * ряда. В макете её и не было.
 */
function trimDots(value: string): string {
  return value.replace(/\.$/, '')
}

function dateChip(date: Date, offset: number, locale: string, translate: Translate): DeliverySlotChip {
  const dayMonth = trimDots(
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date),
  )

  if (offset === 0) {
    return { value: 'd0', label: `${translate('delivery.slot.today')}, ${dayMonth}` }
  }

  if (offset === 1) {
    return { value: 'd1', label: `${translate('delivery.slot.tomorrow')}, ${dayMonth}` }
  }

  const weekday = trimDots(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date))

  return {
    value: `d${offset}`,
    label: `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${dayMonth}`,
  }
}

function shift(days: number): Date {
  const date = new Date()

  date.setDate(date.getDate() + days)

  return date
}

/**
 * Набор слотов под выбранный способ доставки.
 *
 * Экспресс — только сегодня и только те окна, что ещё впереди. Обычный
 * курьер — с завтрашнего дня на неделю вперёд: «1–2 дня» это срок, за
 * который заказ доедет, а не запрет назначить доставку на пятницу.
 */
export function deliverySlotsFor(
  variantId: string | undefined,
  locale: string,
  translate: Translate,
): DeliverySlots {
  if (variantId === 'express') {
    return {
      dates: [dateChip(shift(0), 0, locale, translate)],
      times: windowChips(EXPRESS_WINDOWS, new Date()),
    }
  }

  return {
    dates: Array.from({ length: STANDARD_DAYS }, (_, index) =>
      dateChip(shift(index + 1), index + 1, locale, translate),
    ),
    times: windowChips(STANDARD_WINDOWS),
  }
}

/** Рынки, где дату и время выбирают. */
export function hasDeliverySlots(country: CountryCode): boolean {
  return country === 'ru'
}
