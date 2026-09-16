import { computed, ref } from 'vue'
import type { CountryCode } from '../config/types'
import type { UserType } from '../config/users'
import type { StandVariant } from './useStand'

/**
 * Сессия респондента — сценарий теста, который стенд ведёт сам.
 *
 * Модератор отдаёт одну ссылку вида #/de/new/test и больше ничего не
 * переключает. Дальше стенд сам: профиль → задание → первый концепт →
 * задание → второй концепт → (для новых) прод → финальное спасибо.
 *
 * Зачем так. Раньше версию выбирал респондент по команде модератора, и
 * это был лишний экран прямо перед замером: человек читал список из трёх
 * незнакомых названий и спрашивал, что выбрать. Теперь он видит задание и
 * одну кнопку.
 *
 * Какой концепт идёт первым — монетка при создании сессии. Порядок нужно
 * чередовать, иначе второй вариант всегда выигрывает: задание уже знакомо.
 * Фактический порядок пишется в журнал, так что перекос видно по таблице.
 *
 * Прод проходят только новые пользователи и только последним. Дать его
 * первым значит сделать обучающий прогон и обесценить замеры по концептам.
 */

export interface StandSession {
  /** Общий для всех прогонов одного респондента — по нему они склеиваются. */
  id: string
  country: CountryCode
  user: UserType
  /** Запланированный порядок версий. */
  order: StandVariant[]
  /** Уже пройденные, в порядке прохождения. */
  completed: StandVariant[]
}

const STORAGE_KEY = 'cc3-stand-session'

/**
 * Сессия живёт во вкладке: респондент проходит тест в одной вкладке и не
 * закрывает её. sessionStorage, а не local — это данные одного теста, а не
 * настройка браузера, и следующий респондент на том же устройстве должен
 * начать с чистого листа.
 */
function readStorage(): StandSession | undefined {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)

    return raw ? (JSON.parse(raw) as StandSession) : undefined
  } catch {
    return undefined
  }
}

function writeStorage(value: StandSession | undefined) {
  try {
    if (value) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Хранилище недоступно — сессия живёт до перезагрузки.
  }
}

const current = ref<StandSession | undefined>(readStorage())

function plan(user: UserType): StandVariant[] {
  const concepts: StandVariant[] =
    Math.random() < 0.5 ? ['modal', 'inline'] : ['inline', 'modal']

  return user === 'new' ? [...concepts, 'prod'] : concepts
}

export function useStandSession() {
  /** Сессия этого респондента — если она заведена и совпадает по осям. */
  function sessionFor(country: CountryCode, user: UserType): StandSession | undefined {
    const session = current.value

    return session && session.country === country && session.user === user ? session : undefined
  }

  /**
   * Открыли ссылку сценария. Сессия заводится один раз: возврат на экран
   * задания между прогонами не должен перетасовывать порядок заново.
   */
  function startSession(country: CountryCode, user: UserType) {
    if (sessionFor(country, user)) {
      return
    }

    current.value = {
      id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      country,
      user,
      order: plan(user),
      completed: [],
    }
    writeStorage(current.value)
  }

  /** Прогон закончен — версия уходит в пройденные. */
  function completeRun(variant: StandVariant) {
    const session = current.value

    if (!session || session.completed.includes(variant)) {
      return
    }

    current.value = { ...session, completed: [...session.completed, variant] }
    writeStorage(current.value)
  }

  function nextVariant(country: CountryCode, user: UserType): StandVariant | undefined {
    const session = sessionFor(country, user)

    return session?.order.find((variant) => !session.completed.includes(variant))
  }

  /** Сессия ведётся стендом — значит экран благодарности ведёт дальше сам. */
  const session = computed(() => current.value)

  return { session, sessionFor, startSession, completeRun, nextVariant }
}
