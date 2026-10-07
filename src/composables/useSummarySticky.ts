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
 * Отлипает она ровно тогда, когда в экран входит сам блок сводки: дальше
 * сумма видна и так, а две одинаковые панели с двумя «Итого» на одном
 * экране — это вопрос «а какая из них настоящая» прямо внутри замера.
 * По той же причине при входе блока панель закрывается, а не остаётся
 * висеть поверх него.
 *
 * Состояние на уровне модуля, как у замера прохождения: шапка и блок стоят
 * в разных ветках дерева компонентов и через props друг друга не видят.
 */

/** Раскрыта ли панель под прилипшей шапкой. */
const isExpanded = ref(false)

/** Виден ли на экране сам блок сводки в конце страницы. */
const isBottomVisible = ref(false)

export function useSummarySticky() {
  function toggle() {
    isExpanded.value = !isExpanded.value
  }

  /**
   * Наблюдение за блоком сводки. Возвращает функцию отписки — её вызывает
   * сам блок при размонтировании, иначе наблюдатель переживёт смену версии
   * чекаута и шапка останется отлипшей на новой странице.
   */
  function observeBottomSummary(element: HTMLElement): () => void {
    if (typeof IntersectionObserver === 'undefined') {
      return () => {}
    }

    const observer = new IntersectionObserver((entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting)

      isBottomVisible.value = isVisible

      if (isVisible) {
        isExpanded.value = false
      }
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
      isBottomVisible.value = false
    }
  }

  /** Версия чекаута закрылась — состояние не должно протечь в следующую. */
  function resetSticky() {
    isExpanded.value = false
    isBottomVisible.value = false
  }

  return {
    isExpanded: computed(() => isExpanded.value),
    /** Шапка прилипает, пока блок сводки не показался на экране. */
    isSticky: computed(() => !isBottomVisible.value),
    toggle,
    observeBottomSummary,
    resetSticky,
  }
}
