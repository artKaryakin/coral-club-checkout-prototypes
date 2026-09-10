import { useStand } from './useStand'
import { useStandProfile } from './useStandProfile'
import { useStandRun } from './useStandRun'

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

  function createOrder() {
    void finishRun({
      country: country.value,
      user: user.value,
      // Без варианта в адресе чекаут не открывается, но тип это допускает;
      // прод — та версия, которая показывается по умолчанию.
      variant: variant.value ?? 'prod',
      locale: locale.value,
      profile: profile.value,
    })
  }

  return { createOrder }
}
