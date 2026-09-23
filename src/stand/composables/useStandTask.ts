import { computed } from 'vue'
import { routeHref, useStand } from './useStand'
import { useStandSession } from './useStandSession'

/**
 * Экран задания: что показать респонденту прямо сейчас.
 *
 * Одна логика на два места — на сам экран задания в начале сценария и на
 * экран благодарности, где задание повторяется вместе с кнопкой к
 * следующему варианту. Держать её в двух компонентах нельзя: они разойдутся
 * на первом же изменении, и половина респондентов увидит другой сценарий.
 *
 * Текст задания один и тот же на всех прогонах. Это не оплошность: мы
 * сравниваем версии на одном задании, и менять формулировку между
 * вариантами значит менять и то, что измеряем.
 */
export function useStandTask() {
  const { country, user, t } = useStand()
  const { sessionFor, nextVariant } = useStandSession()

  const session = computed(() => sessionFor(country.value, user.value))

  /** Сценарий ведёт стенд — значит и дальше человека ведём мы, а не модератор. */
  const isSessionMode = computed(() => Boolean(session.value))

  const doneCount = computed(() => session.value?.completed.length ?? 0)

  const next = computed(() => nextVariant(country.value, user.value))

  /** Все запланированные прогоны пройдены — тест закончен. */
  const isSessionDone = computed(() => isSessionMode.value && !next.value)

  const taskText = computed(() => t(`task.${user.value}`))

  /**
   * Приписка к заданию: адрес можно брать любой существующий.
   *
   * Без неё человек читает «оформите доставку домой» буквально и вводит
   * свой настоящий адрес — а это чужой прототип, который он видит первый
   * раз. Часть респондентов на этом месте останавливается и спрашивает
   * модератора, остальные вводят данные, которые нам не нужны и которые
   * потом придётся вычищать из журнала.
   */
  const taskHint = computed(() => t('task.hint'))

  /**
   * Подпись кнопки меняется по шагу, а не по версии: респондент не должен
   * знать, какой концепт ему достался — иначе он начнёт сравнивать названия,
   * а не поведение.
   */
  const nextLabel = computed(() =>
    doneCount.value === 0 ? t('task.start') : t('task.another'),
  )

  const nextHref = computed(() =>
    next.value ? routeHref(country.value, user.value, next.value) : routeHref(),
  )

  return {
    session,
    isSessionMode,
    isSessionDone,
    doneCount,
    taskText,
    taskHint,
    nextLabel,
    nextHref,
  }
}
