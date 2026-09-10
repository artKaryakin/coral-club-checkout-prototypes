import { computed, ref } from 'vue'
import { countries, countryCodes, defaultCountry } from '../config/countries'
import { defaultUser, isUserType, legacyUserAliases } from '../config/users'
import type { UserType } from '../config/users'
import type { CountryCode, LocaleCode } from '../config/types'
import { isLocale, translate } from '../i18n'

/**
 * Оси стенда. Все три читаются из адреса:
 *
 *   #/{country}/{user}/{variant}      — например #/de/saved/modal
 *   ?locale=en                        — необязательное переопределение языка
 *
 * Порядок осей повторяет порядок выбора на входе: сначала страна (она же
 * задаёт язык интерфейса), потом тип пользователя, потом версия чекаута.
 * Неполный адрес — это не ошибка, а незаконченный выбор: #/de открывает
 * второй шаг, #/de/saved — третий. Поэтому кнопка «назад» в браузере
 * работает как возврат по шагам, ничего дополнительно писать не нужно.
 *
 * Одна полная ссылка задаёт конфигурацию целиком: модератор отправляет её
 * респонденту и ничего не переключает руками.
 */
export type StandVariant = 'prod' | 'modal' | 'inline'

export const standVariants: StandVariant[] = ['prod', 'modal', 'inline']

/**
 * Шаг с профилем стоит между страной и типом пользователя и занимает
 * в адресе место типа пользователя: #/ru/profile.
 *
 * Отдельный сегмент нужен, чтобы шаг попал в историю браузера: без него
 * профиль и выбор пользователя жили бы по одному адресу #/ru, и «назад»
 * с третьего шага перепрыгивало бы сразу на выбор страны.
 */
const PROFILE_SEGMENT = 'profile'

/**
 * Журнал прохождений — служебный экран модератора, а не шаг выбора.
 * Стоит на первом сегменте: он ничего не знает ни про страну, ни про версию.
 */
const LOG_SEGMENT = 'log'

/** Незаконченный выбор: то, что уже указано в адресе. */
export interface StandSelection {
  country?: CountryCode
  user?: UserType
  variant?: StandVariant
  /** Открыт шаг заполнения профиля, тип пользователя ещё не выбран. */
  profileStep?: boolean
  /** Открыт служебный экран журнала прохождений. */
  logScreen?: boolean
}

/** Полностью определённая конфигурация — с ней открывается прототип. */
export interface StandRoute {
  country: CountryCode
  user: UserType
  variant: StandVariant
  locale: LocaleCode
}

function isVariant(value: string | undefined): value is StandVariant {
  return standVariants.includes(value as StandVariant)
}

function isCountry(value: string | undefined): value is CountryCode {
  return countryCodes.includes(value as CountryCode)
}

/**
 * Разбор старой схемы #/{variant}/{country}/{case} и #/{variant}/{profile}.
 * Возвращает segments в новом порядке, если адрес опознан как старый.
 */
function parseLegacy(segments: string[]): string[] | undefined {
  const [variant, second, third] = segments

  if (!isVariant(variant)) {
    return undefined
  }

  const user = legacyUserAliases[third ?? ''] ?? legacyUserAliases[second ?? '']

  if (!user) {
    return undefined
  }

  const country = isCountry(second) ? second : defaultCountry

  return [country, user, variant]
}

function parseHash(): StandSelection {
  const [path, query] = window.location.hash.replace(/^#\/?/, '').split('?')
  const segments = path.split('/').filter(Boolean)
  const legacy = parseLegacy(segments)
  const [first, second, third] = legacy ?? segments

  const selection: StandSelection = {
    country: isCountry(first) ? first : undefined,
    user: isUserType(second) ? second : undefined,
    variant: isVariant(third) ? third : undefined,
    profileStep: second === PROFILE_SEGMENT,
    logScreen: first === LOG_SEGMENT,
  }

  if (legacy && selection.country && selection.user && selection.variant) {
    // Адрес в строке браузера подменяется на канонический: ссылка из отчёта
    // должна совпадать с тем, что видит респондент. replaceState не создаёт
    // запись в истории и не вызывает hashchange, поэтому выбор возвращается
    // здесь же, а не ждёт повторного разбора.
    const canonical = routeHref(selection.country, selection.user, selection.variant)

    window.history.replaceState(null, '', query ? `${canonical}?${query}` : canonical)
  }

  return selection
}

function parseLocale(): LocaleCode | undefined {
  const [, hashQuery] = window.location.hash.split('?')
  const requested =
    new URLSearchParams(hashQuery ?? '').get('locale') ??
    new URLSearchParams(window.location.search).get('locale') ??
    undefined

  return isLocale(requested) ? requested : undefined
}

// Маршрут общий на всё приложение, поэтому слушатель ставится один раз
// на модуль, а не в каждом компоненте.
const currentSelection = ref<StandSelection>(parseHash())
const requestedLocale = ref<LocaleCode | undefined>(parseLocale())

window.addEventListener('hashchange', () => {
  currentSelection.value = parseHash()
  requestedLocale.value = parseLocale()
})

/** Ссылка на любой шаг выбора: неуказанные оси просто отбрасываются. */
export function routeHref(country?: CountryCode, user?: UserType, variant?: StandVariant): string {
  return `#/${[country, user, variant].filter(Boolean).join('/')}`
}

/** Ссылка на шаг заполнения профиля выбранной страны. */
export function profileHref(country: CountryCode): string {
  return `#/${country}/${PROFILE_SEGMENT}`
}

/** Ссылка на журнал прохождений. */
export function logHref(): string {
  return `#/${LOG_SEGMENT}`
}

export function useStand() {
  const selection = computed(() => currentSelection.value)

  const country = computed(() => currentSelection.value.country ?? defaultCountry)
  const user = computed(() => currentSelection.value.user ?? defaultUser)
  const variant = computed(() => currentSelection.value.variant)

  const countryConfig = computed(() => countries[country.value])

  // Язык берётся из страны. Переопределение нужно, чтобы проверить
  // локализацию отдельно от набора полей.
  const locale = computed<LocaleCode>(
    () => requestedLocale.value ?? countryConfig.value.locale,
  )

  /** Выбор закончен — можно открывать прототип. */
  const route = computed<StandRoute | undefined>(() => {
    const { country: c, user: u, variant: v } = currentSelection.value

    return c && u && v ? { country: c, user: u, variant: v, locale: locale.value } : undefined
  })

  const hasSavedAddresses = computed(() => user.value === 'saved')

  const isLogScreen = computed(() => currentSelection.value.logScreen === true)

  const isModal = computed(() => variant.value === 'modal')
  const isInline = computed(() => variant.value === 'inline')
  const isProd = computed(() => variant.value === 'prod')

  /**
   * Панель модератора показывается только по ?debug=1. Флаг ищется и в
   * обычной строке запроса, и внутри хеша — набирают и так, и так.
   */
  const isDebug = computed(
    () =>
      window.location.search.includes('debug=1') || window.location.hash.includes('debug=1'),
  )

  const t = (key: string, params?: Record<string, string | number>) =>
    translate(locale.value, country.value, key, params)

  return {
    selection,
    route,
    country,
    user,
    variant,
    locale,
    countryConfig,
    hasSavedAddresses,
    isLogScreen,
    isModal,
    isInline,
    isProd,
    isDebug,
    t,
  }
}
