import { onScopeDispose, ref } from 'vue'
import { resolveProvider } from '../suggest'
import { isSuggestCoolingDown, startSuggestCooldown } from '../suggest/cooldown'
import type { AddressSuggestion, SuggestStatus } from '../suggest/types'
import { useStand } from './useStand'

/** С двух символов выдача бессмысленная, а запросов много. */
const MIN_QUERY = 3

/**
 * Пауза после последнего нажатия клавиши.
 *
 * Было 300 мс — три запроса в секунду с одного поля. Публичные клиенты
 * Photon ходят к демо-серверу не чаще раза в секунду, и за сессию разница
 * набегает в сотни запросов. 500 мс по ощущению те же «сразу», а нагрузка
 * вдвое меньше.
 */
const DEBOUNCE_MS = 500

/**
 * Сколько ждём ответа.
 *
 * Главное в этой правке. Ограничения у сервиса не всегда приходят ошибкой:
 * запрос может просто не ответить. Без своего срока ожидание длилось
 * вечно — поле оставалось в состоянии «ищем», запасной список не
 * появлялся, и со стороны это выглядело так, будто подсказок нет вовсе.
 * Именно это поймали на прогоне: модальную версию прошли, к инлайну сервис
 * уже отказывал.
 */
const TIMEOUT_MS = 5000

/**
 * Подсказки для строки адреса.
 *
 * Четыре вещи, без которых автокомплит выглядит сломанным:
 *  - пауза после ввода, иначе запрос уходит на каждую букву;
 *  - отмена предыдущего запроса, иначе медленный ответ на «Мос» перебивает
 *    список, собранный по «Москворечье»;
 *  - свой срок ожидания, иначе молчащий сервис держит поле в «ищем» вечно;
 *  - честный ответ при отказе сервиса — публичный Photon без гарантий, и
 *    посреди интервью человек должен узнать, что адрес можно ввести руками,
 *    а не гадать, почему список пуст.
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

  /**
   * Сервис не ответил. Раньше здесь подставлялся запасной список из трёх
   * выдуманных адресов, и это было хуже пустоты: респондент видел под своим
   * вводом «Москва, ул. Москворечье, 43», выбирал его и уезжал на чужой
   * адрес. В замере это уже не его сценарий.
   *
   * Теперь список пуст, а под полем сказано, что адрес можно ввести руками.
   * Так и есть: ни одно поле формы не заблокировано, а кнопка «Продолжить»
   * на шаге поиска не требует выбранной подсказки.
   */
  function fallback() {
    items.value = []
    status.value = 'error'
  }

  async function request(query: string) {
    // Сервис отказал только что — ждать от него ответа незачем, а каждый
    // новый запрос к нему только продлевает отказ.
    if (isSuggestCoolingDown()) {
      fallback()

      return
    }

    const current = new AbortController()

    controller = current
    status.value = 'loading'

    // Прерывание по сроку и прерывание следующим запросом выглядят
    // одинаково — оба приходят как aborted. Различаем их флагом: по сроку
    // нужно показать запасной список, а перебитый запрос молча уходит,
    // иначе он затрёт список, собранный по более новому вводу.
    let isExpired = false

    const expiry = setTimeout(() => {
      isExpired = true
      current.abort()
    }, TIMEOUT_MS)

    try {
      const result = await resolveProvider(country.value).suggest(
        query,
        country.value,
        current.signal,
      )

      if (current.signal.aborted) {
        return
      }

      items.value = result
      status.value = result.length > 0 ? 'ready' : 'empty'
    } catch {
      if (current.signal.aborted && !isExpired) {
        return
      }

      startSuggestCooldown()
      fallback()
    } finally {
      clearTimeout(expiry)
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
