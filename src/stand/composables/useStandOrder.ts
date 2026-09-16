import { useStand } from './useStand'
import { useStandProfile } from './useStandProfile'
import { useStandRun } from './useStandRun'
import { useStandSession } from './useStandSession'

/**
 * Создание заказа — одна кнопка на все три версии чекаута.
 *
 * Версии подключают её одинаково: `@click="createOrder"` на кнопке
 * «Перейти к оплате». Всё остальное — какой это кейс, сколько заняло, что
 * за человек — собирается здесь, чтобы вёрстка про замер ничего не знала
 * и три реализации не разъехались.
 *
 * Прод подключён наравне с концептами намеренно. Без его времени сравнивать
 * не с чем: концепт «быстрее» только относительно того, что есть сейчас.
 */
export function useStandOrder() {
  const { country, user, variant, locale } = useStand()
  const { profile } = useStandProfile()
  const { finishRun } = useStandRun()
  const { sessionFor, completeRun } = useStandSession()

  function createOrder() {
    // Без варианта в адресе чекаут не открывается, но тип это допускает;
    // прод — та версия, которая показывается по умолчанию.
    const current = variant.value ?? 'prod'
    const session = sessionFor(country.value, user.value)

    // Сначала отмечаем прогон в сессии, потом пишем строку: номер шага
    // должен попасть в журнал уже с учётом этого прогона.
    completeRun(current)

    void finishRun({
      country: country.value,
      user: user.value,
      variant: current,
      locale: locale.value,
      profile: profile.value,
      sessionId: session?.id,
      step: session ? session.completed.length + 1 : 0,
    })
  }

  return { createOrder }
}
