import type { CountryCode } from '../config/types'

/**
 * Единый формат подсказки адреса.
 *
 * Форма не знает, кто отдал подсказку — Photon, DaData или Loqate. Она
 * получает уже разобранный адрес одинаковой формы, поэтому смена провайдера
 * не задевает ни поля, ни вёрстку. Это тот же приём, что и в адресном шлюзе:
 * различия провайдеров заканчиваются на границе этого типа.
 */
export interface AddressSuggestion {
  id: string
  /** Готовая строка адреса в местном формате — то, что попадёт в поле. */
  label: string
  street: string
  house: string
  postal: string
  city: string
  region: string
  lat?: number
  lng?: number
}

/** Состояние запроса подсказок — от него зависит, что показать под полем. */
export type SuggestStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

/** Точка на карте — та же форма, что у карты, без зависимости от неё. */
export interface SuggestPoint {
  lat: number
  lng: number
}

export interface SuggestProvider {
  code: string
  /**
   * Запрос отменяется через signal: пока пользователь печатает, ответы на
   * прошлые запросы не должны перебивать список.
   */
  suggest(query: string, country: CountryCode, signal: AbortSignal): Promise<AddressSuggestion[]>
  /**
   * Обратное геокодирование — адрес по точке на карте. Нужно, чтобы карта и
   * поле адреса были одним элементом управления: ткнули в карту — увидели
   * адрес, выбрали подсказку — увидели точку.
   */
  reverse(
    point: SuggestPoint,
    country: CountryCode,
    signal: AbortSignal,
  ): Promise<AddressSuggestion | undefined>
}
