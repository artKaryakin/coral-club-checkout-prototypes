import { onScopeDispose, ref } from 'vue'
import { resolveProvider } from '../suggest'
import { mockSuggest } from '../suggest/mock'
import type { AddressSuggestion, SuggestStatus } from '../suggest/types'
import { useStand } from './useStand'

/** С двух символов выдача бессмысленная, а запросов много. */
const MIN_QUERY = 3

/** Пауза после последнего нажатия клавиши. */
const DEBOUNCE_MS = 300

/**
 * Подсказки для строки адреса.
 *
 * Три вещи, без которых автокомплит выглядит сломанным:
 *  - пауза после ввода, иначе запрос уходит на каждую букву;
 *  - отмена предыдущего запроса, иначе медленный ответ на «Мос» перебивает
 *    список, собранный по «Москворечье»;
 *  - живой список при отказе сервиса — публичный Photon без гарантий, и
 *    падать посреди интервью он не должен.
 */
export function useAddressSuggest() {
  const { country } = useStand()

  const items = ref<AddressSuggestion[]>([])
  const status = ref<SuggestStatus>('idle')

  let timer: ReturnType<typeof setTimeout> | undefined
  let controller: AbortController | undefined

  function cancel() {
    clearTimeout(timer)
    controller?.abort()
    timer = undefined
    controller = undefined
  }

  function reset() {
    cancel()
    items.value = []
    status.value = 'idle'
  }

  async function request(query: string) {
    const current = new AbortController()

    controller = current
    status.value = 'loading'

    try {
      const result = await resolveProvider(country.value).suggest(query, country.value, current.signal)

      if (current.signal.aborted) {
        return
      }

      items.value = result
      status.value = result.length > 0 ? 'ready' : 'empty'
    } catch {
      if (current.signal.aborted) {
        return
      }

      // Сервис не ответил: показываем запасной список и говорим об этом,
      // а не притворяемся, что подсказки настоящие.
      items.value = mockSuggest(query, country.value)
      status.value = 'error'
    }
  }

  function ask(query: string) {
    cancel()

    if (query.trim().length < MIN_QUERY) {
      items.value = []
      status.value = 'idle'

      return
    }

    timer = setTimeout(() => {
      void request(query.trim())
    }, DEBOUNCE_MS)
  }

  onScopeDispose(cancel)

  return { items, status, ask, reset }
}
