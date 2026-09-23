import { computed, ref } from 'vue'

/**
 * Требование сохранить адрес перед созданием заказа.
 *
 * Инлайн-концепт разворачивает форму адреса прямо на странице, и кнопка
 * «Сохранить» стоит посреди неё, а не в конце сценария. Человек дозаполняет
 * поля, видит внизу кнопку оплаты и жмёт её, не сохранив адрес: форма
 * выглядит заполненной, и повод нажать ещё одну кнопку неочевиден.
 *
 * Поэтому оплата не проходит молча мимо несохранённого адреса: страница
 * возвращает человека к «Сохранить» и объясняет, чего от него ждут. Это
 * часть предмета сравнения — сколько стоит лишний шаг сохранения, — и
 * поведение должно быть одинаковым у всех респондентов, а не зависеть от
 * того, догадался ли конкретный человек нажать кнопку.
 *
 * Сторож взводится только тем концептом, которому он нужен. Модальный
 * концепт сохраняет адрес кнопкой «Продолжить» в окне — там пройти мимо
 * нельзя, — а прод не трогаем вовсе. Состояние на уровне модуля, как у
 * замера прохождения: кнопка оплаты и форма адреса стоят в разных ветках
 * дерева компонентов и через props друг друга не видят.
 */

/** Концепт с требованием сейчас на экране. */
const isArmed = ref(false)

/** Адрес сохранён и выбран — оплата разрешена. */
const isAddressSaved = ref(false)

const isWarningVisible = ref(false)

/** Прокрутка к кнопке «Сохранить» — её регистрирует сама форма адреса. */
const saveAnchor = ref<(() => void) | undefined>()

/**
 * Запасная прокрутка к блоку доставки: адресную книгу открыли, но адрес из
 * неё не выбрали — кнопки «Сохранить» на экране нет вовсе.
 */
const blockAnchor = ref<(() => void) | undefined>()

export function useAddressGuard() {
  function armGuard() {
    isArmed.value = true
    isAddressSaved.value = false
    isWarningVisible.value = false
  }

  function disarmGuard() {
    isArmed.value = false
    isAddressSaved.value = false
    isWarningVisible.value = false
    saveAnchor.value = undefined
    blockAnchor.value = undefined
  }

  /** Адрес выбран или снят — сообщает блок доставки. */
  function setAddressSaved(value: boolean) {
    isAddressSaved.value = value

    if (value) {
      isWarningVisible.value = false
    }
  }

  function registerSaveAnchor(anchor: (() => void) | undefined) {
    saveAnchor.value = anchor
  }

  function registerBlockAnchor(anchor: (() => void) | undefined) {
    blockAnchor.value = anchor
  }

  /**
   * Можно ли создавать заказ. Если нельзя — показывает предупреждение и
   * возвращает человека к кнопке «Сохранить».
   */
  function ensureAddressSaved(): boolean {
    if (!isArmed.value || isAddressSaved.value) {
      return true
    }

    isWarningVisible.value = true
    ;(saveAnchor.value ?? blockAnchor.value)?.()

    return false
  }

  return {
    isWarningVisible: computed(() => isWarningVisible.value),
    armGuard,
    disarmGuard,
    setAddressSaved,
    registerSaveAnchor,
    registerBlockAnchor,
    ensureAddressSaved,
  }
}
