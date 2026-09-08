import { countries } from '../config/countries'
import type { CountryCode, CountryConfig } from '../config/types'
import { photonProvider } from './photon'
import type { AddressSuggestion, SuggestPoint, SuggestProvider } from './types'

export type { AddressSuggestion, SuggestPoint, SuggestStatus } from './types'
export { applySuggestion } from './applySuggestion'
export type { FieldValues } from './applySuggestion'

/**
 * Реестр провайдеров подсказок.
 *
 * Ровно то место, ради которого затевается адресный шлюз: страна выбирает
 * провайдера, форма о нём не знает. Сейчас реализация одна — бесплатный
 * Photon; чтобы добавить DaData для России, нужен новый файл рядом с
 * photon.ts и одна строка здесь, а не переделка чекаута.
 */
const providers: Partial<Record<CountryConfig['provider'], SuggestProvider>> = {
  photon: photonProvider,
}

/** Провайдер, которым подменяются ещё не подключённые. */
const fallbackProvider = photonProvider

export function resolveProvider(country: CountryCode): SuggestProvider {
  return providers[countries[country].provider] ?? fallbackProvider
}

/**
 * Адрес по точке на карте.
 *
 * Ошибку не подменяем заглушкой: пользователь ткнул в конкретное место, и
 * показать ему вымышленный адрес хуже, чем не показать никакого — метка
 * останется там, куда он ткнул, а адрес он допишет сам.
 */
export async function reverseAddress(
  point: SuggestPoint,
  country: CountryCode,
  signal: AbortSignal,
): Promise<AddressSuggestion | undefined> {
  try {
    return await resolveProvider(country).reverse(point, country, signal)
  } catch {
    return undefined
  }
}
