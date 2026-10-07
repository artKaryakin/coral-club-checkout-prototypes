import { computed, ref } from 'vue'

/**
 * Прилипшая шапка сводки заказа.
 *
 * Итоговая сумма лежит в самом низу страницы, под адресом, доставкой и
 * оплатой. Человек, который держит её в голове («хватит ли кошелька»,
 * «сколько с доставкой»), вынужден листать туда и обратно, теряя место, на
 * котором остановился. Поэтому шапка сводки прилипает к верху экрана и
 * несёт сумму с собой, а по нажатию раскрывается в полную сводку.
 *
 * Отлипает она, когда блок сводки внизу страницы доехал до неё самой:
 * верхний край блока поравнялся с нижним краем полосы. Там блок и
 * перехватывает сумму.
 *
 * Сначала правило было другим — «как только блок сводки показался на
 * экране», — и на коротких страницах полоса не прилипала вовсе: у
 * модального концепта тело чекаута умещается почти целиком, и сводка видна
 * снизу сразу. Полоса отпускалась на первом же движении.
 *
 * Положение считается по прокрутке, а не наблюдателем пересечений:
 * наблюдатель сообщает только моменты пересечения границ, и на короткой
 * странице, где метка попадает в экран сразу, нужный момент он пропускал.
 * Чтение getBoundingClientRect раз в кадр для одного элемента ничего не
 * стоит и ведёт себя одинаково везде.
 *
 * Состояние на уровне модуля, как у замера прохождения: шапка и блок стоят
 * в разных ветках дерева компонентов и через props друг друга не видят.
 */

/** Раскрыта ли панель под прилипшей шапкой. */
const isExpanded = ref(false)

/** Блок сводки дошёл до полосы — дальше сумму показывает он. */
const isBottomReached = ref(false)

/** Высота полосы: по ней проходит линия передачи. */
const barHeight = ref(52)

export function useSummarySticky() {
  function toggle() {
    isExpanded.value = !isExpanded.value
  }

  /** Полоса сообщает свою высоту — линия передачи проходит по её низу. */
  function setBarHeight(value: number) {
    if (value > 0) {
      barHeight.value = value
    }
  }

  /**
   * Следим за меткой в начале блока сводки. Возвращает функцию отписки: её
   * вызывает сам блок при размонтировании, иначе слушатели переживут смену
   * версии чекаута.
   */
  function trackSummaryAnchor(element: HTMLElement): () => void {
    let frame = 0

    function measure() {
      frame = 0

      const reached = element.getBoundingClientRect().top <= barHeight.value

      isBottomReached.value = reached

      if (reached) {
        isExpanded.value = false
      }
    }

    // Пересчёт раз в кадр: событий прокрутки приходит больше, чем экран
    // успевает перерисовать.
    function schedule() {
      if (frame === 0) {
        frame = window.requestAnimationFrame(measure)
      }
    }

    measure()

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)

      if (frame !== 0) {
        window.cancelAnimationFrame(frame)
      }

      isBottomReached.value = false
    }
  }

  /** Версия чекаута закрылась — состояние не должно протечь в следующую. */
  function resetSticky() {
    isExpanded.value = false
    isBottomReached.value = false
  }

  return {
    isExpanded: computed(() => isExpanded.value),
    /** Полоса прилипшая, пока блок сводки до неё не доехал. */
    isSticky: computed(() => !isBottomReached.value),
    toggle,
    setBarHeight,
    trackSummaryAnchor,
    resetSticky,
  }
}
