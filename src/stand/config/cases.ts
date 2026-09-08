import type { CountryCode } from './types'

/**
 * Стартовые состояния под usability-кейсы.
 *
 * Кейс полностью определяет, с чем пользователь встречает форму: сколько
 * адресов в книге, какой выбран, есть ли ошибка. Это заменяет прежнюю ось
 * profile (new / returning) — она поглощается кейсом.
 *
 * Ссылка вида #/inline/us/UC-07 открывает нужное состояние без единого клика:
 * модератор ничего не набивает руками во время сессии.
 */
export type CaseId =
  | 'UC-01' | 'UC-02' | 'UC-03' | 'UC-04' | 'UC-05' | 'UC-06' | 'UC-07'
  | 'UC-08' | 'UC-09' | 'UC-10' | 'UC-11' | 'UC-12' | 'UC-13'

export interface CaseConfig {
  id: CaseId
  /** Короткое имя для панели модератора и стартового экрана. */
  title: string
  /** Задание респонденту — читается модератором дословно. */
  task: string
  /** Сколько адресов лежит в книге на старте. */
  savedAddresses: number
  /** Индекс выбранного адреса; undefined — не выбран ни один. */
  selectedAddress?: number
  /** Способ доставки, выбранный на старте. */
  deliveryMethod?: 'courier' | 'pickup'
  /** Предустановленная ошибка — для кейсов про recovery и валидацию. */
  error?: 'validation' | 'methodUnavailable' | 'addressNotFound'
  /** Подсказки провайдера отключены — проверяем ручной ввод. */
  suggestionsDisabled?: boolean
  /** Кейс обязателен в каждой стране: вскрывает страновые различия формы. */
  everyCountry?: boolean
  /** Скрипт сессии, в который входит кейс. */
  script: 'newcomer' | 'returning'
}

export const cases: Record<CaseId, CaseConfig> = {
  'UC-01': {
    id: 'UC-01',
    title: 'Пустая книга, доставка домой',
    task: 'Оформите заказ так, чтобы его привезли вам домой',
    savedAddresses: 0,
    script: 'newcomer',
  },
  'UC-02': {
    id: 'UC-02',
    title: 'Пустая книга, самовывоз',
    task: 'Вам удобнее забрать заказ самому — оформите так',
    savedAddresses: 0,
    deliveryMethod: 'pickup',
    script: 'newcomer',
  },
  'UC-03': {
    id: 'UC-03',
    title: 'Ввод своего адреса',
    task: 'Введите свой домашний адрес',
    savedAddresses: 0,
    everyCountry: true,
    script: 'newcomer',
  },
  'UC-04': {
    id: 'UC-04',
    title: 'Адреса нет в подсказках',
    task: 'Оформите доставку на адрес, которого нет в подсказках',
    savedAddresses: 0,
    suggestionsDisabled: true,
    everyCountry: true,
    script: 'newcomer',
  },
  'UC-05': {
    id: 'UC-05',
    title: 'Один сохранённый адрес',
    task: 'Закажите на свой обычный адрес',
    savedAddresses: 1,
    selectedAddress: 0,
    script: 'returning',
  },
  'UC-06': {
    id: 'UC-06',
    title: 'Четыре адреса, нужен не первый',
    task: 'Отправьте заказ на рабочий адрес',
    savedAddresses: 4,
    selectedAddress: 0,
    script: 'returning',
  },
  'UC-07': {
    id: 'UC-07',
    title: 'Добавление при трёх сохранённых',
    task: 'Вы переехали. Оформите заказ на новый адрес',
    savedAddresses: 3,
    selectedAddress: 0,
    script: 'returning',
  },
  'UC-08': {
    id: 'UC-08',
    title: 'Правка сохранённого адреса',
    task: 'В сохранённом адресе неверная квартира — исправьте и оформите заказ',
    savedAddresses: 2,
    selectedAddress: 0,
    script: 'returning',
  },
  'UC-09': {
    id: 'UC-09',
    title: 'Заказ другому человеку',
    task: 'Закажите в подарок родственнику в другой город, получать будет он',
    savedAddresses: 2,
    selectedAddress: 0,
    script: 'returning',
  },
  'UC-10': {
    id: 'UC-10',
    title: 'Дистрибьютор, восемь адресов',
    task: 'Оформите заказ клиенту, который у вас уже заказывал',
    savedAddresses: 8,
    script: 'returning',
  },
  'UC-11': {
    id: 'UC-11',
    title: 'Способ доставки недоступен',
    task: 'Для этого адреса курьер недоступен — оформите заказ иначе',
    savedAddresses: 1,
    selectedAddress: 0,
    deliveryMethod: 'courier',
    error: 'methodUnavailable',
    script: 'newcomer',
  },
  'UC-12': {
    id: 'UC-12',
    title: 'Прерывание при заполнении',
    task: 'Заполните адрес — модератор прервёт процесс',
    savedAddresses: 0,
    script: 'newcomer',
  },
  'UC-13': {
    id: 'UC-13',
    title: 'Разовая подмена адреса',
    task: 'В этот раз доставьте на другой адрес, но постоянный не меняйте',
    savedAddresses: 2,
    selectedAddress: 0,
    script: 'returning',
  },
}

export const caseIds = Object.keys(cases) as CaseId[]

export const defaultCase: CaseId = 'UC-01'

/** Кейсы, которые обязательно прогоняются в каждой стране выборки. */
export const mandatoryEveryCountry = caseIds.filter((id) => cases[id].everyCountry)

export function isCaseId(value: string | undefined): value is CaseId {
  return caseIds.includes(value as CaseId)
}

export function countryHasCase(country: CountryCode, id: CaseId): boolean {
  // Пока все кейсы применимы ко всем странам. Когда появится рынок,
  // где сценарий физически невозможен (например, нет самовывоза),
  // исключения описываются здесь.
  return Boolean(country) && id in cases
}
