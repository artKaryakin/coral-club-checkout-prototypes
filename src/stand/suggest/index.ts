import { countries } from '../config/countries'
import type { CountryCode, CountryConfig } from '../config/types'
import { isSuggestCoolingDown, startSuggestCooldown } from './cooldown'
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

/** Сколько ждём адрес по точке, прежде чем считать, что ответа не будет. */
const REVERSE_TIMEOUT_MS = 5000

/**
 * Адрес по точке на карте.
 *
 * Ошибку не подменяем заглушкой: пользователь ткнул в конкретное место, и
 * показать ему вымышленный адрес хуже, чем не показать никакого — метка
 * останется там, куда он ткнул, а адрес он допишет сам.
 *
 * Свой срок ожидания здесь по той же причине, что и у подсказок: молчащий
 * сервис оставлял карту в вечном ожидании адреса. И отказ засчитывается в
 * общую паузу — касания карты ходят к тому же серверу, что и ввод.
 */
export async function reverseAddress(
  point: SuggestPoint,
  country: CountryCode,
  signal: AbortSignal,
): Promise<AddressSuggestion | undefined> {
  if (isSuggestCoolingDown()) {
    return undefined
  }

  const expiry = new AbortController()
  const timer = setTimeout(() => expiry.abort(), REVERSE_TIMEOUT_MS)
  const stop = () => expiry.abort()

  signal.addEventListener('abort', stop)

  try {
    return await resolveProvider(country).reverse(point, country, expiry.signal)
  } catch {
    if (!signal.aborted) {
      startSuggestCooldown()
    }

    return undefined
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', stop)
  }
}
