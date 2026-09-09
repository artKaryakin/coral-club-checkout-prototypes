/**
 * Запрет масштабирования всей страницы жестами.
 *
 * Safari на iOS с версии 10 игнорирует user-scalable=no в мета-теге, поэтому
 * одного мета-тега мало: щипок по форме всё равно растягивает страницу, и
 * респондент на интервью половину времени возит вёрстку пальцем вместо того,
 * чтобы оформлять заказ.
 *
 * Отменяются только жесты Safari (gesturestart/gesturechange/gestureend) и
 * двойной тап. Обычная прокрутка не трогается. Карта работает на pointer-
 * событиях и свои жесты обрабатывает сама, так что её зум это не задевает.
 */

/** Событий gesture* нет в стандартных типах — они существуют только в Safari. */
const gestureEvents = ['gesturestart', 'gesturechange', 'gestureend']

/** Двойной тап меньше чем за столько миллисекунд Safari считает зумом. */
const DOUBLE_TAP_MS = 300

export function lockPageZoom() {
  const prevent = (event: Event) => event.preventDefault()

  gestureEvents.forEach((name) => {
    document.addEventListener(name, prevent, { passive: false })
  })

  let lastTouchEnd = 0

  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now()

      if (now - lastTouchEnd < DOUBLE_TAP_MS) {
        event.preventDefault()
      }

      lastTouchEnd = now
    },
    { passive: false },
  )
}
