import type { AddressSuggestion } from './types'

/**
 * Память на ответы сервиса подсказок в пределах одного прогона.
 *
 * За прохождение один и тот же текст уходит к сервису по нескольку раз:
 * человек стирает последнюю букву и возвращает её, правит дом и снова
 * трогает строку адреса, возвращается к полю из формы. У «Дадаты» лимит
 * суточный — 10 000 запросов на все виды подсказок, — и повторы его тратят
 * впустую.
 *
 * Память живёт на уровне модуля, потому что у каждого поля формы свой
 * экземпляр useAddressSuggest, а сервис один на всех.
 *
 * И обнуляется в начале каждого прогона — это не оптимизация, а условие
 * честного замера. Иначе вторая версия чекаута получала бы мгновенные
 * подсказки по адресу, который респондент уже вводил в первой, и выигрывала
 * бы у неё время просто за счёт порядка показа.
 */
const LIMIT = 60

const cache = new Map<string, AddressSuggestion[]>()

export const suggestCache = {
  get(key: string): AddressSuggestion[] | undefined {
    return cache.get(key)
  },
}

export function rememberSuggest(key: string, items: AddressSuggestion[]): void {
  // Самая старая запись уходит первой: Map хранит порядок вставки, и этого
  // достаточно — список короткий, а точность вытеснения здесь ни на что
  // не влияет.
  if (cache.size >= LIMIT) {
    const oldest = cache.keys().next().value

    if (oldest !== undefined) {
      cache.delete(oldest)
    }
  }

  cache.set(key, items)
}

export function resetSuggestCache(): void {
  cache.clear()
}
