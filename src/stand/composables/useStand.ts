import { computed, ref } from 'vue'
import { countries, countryCodes, defaultCountry } from '../config/countries'
import { cases, defaultCase, isCaseId } from '../config/cases'
import type { CaseConfig, CaseId } from '../config/cases'
import type { CountryCode, LocaleCode } from '../config/types'
import { isLocale, translate } from '../i18n'

/**
 * Оси стенда. Все три читаются из адреса:
 *
 *   #/{variant}/{country}/{case}          — например #/inline/us/UC-03
 *   ?locale=en                            — необязательное переопределение языка
 *
 * Одна ссылка задаёт конфигурацию целиком: модератор отправляет её
 * респонденту и ничего не переключает вручную. В отчёте ссылка равна
 * условиям, при которых сделано наблюдение.
 *
 * Ось profile (new / returning) больше не нужна: стартовое состояние
 * полностью описывает кейс.
 */
export type StandVariant = 'prod' | 'modal' | 'inline'

export const standVariants: StandVariant[] = ['prod', 'modal', 'inline']

export const standVariantLabels: Record<StandVariant, string> = {
  prod: 'Прод',
  modal: 'Модальный',
  inline: 'Инлайн',
}

export interface StandRoute {
  variant: StandVariant
  country: CountryCode
  caseId: CaseId
  locale: LocaleCode
}

function isVariant(value: string | undefined): value is StandVariant {
  return standVariants.includes(value as StandVariant)
}

function isCountry(value: string | undefined): value is CountryCode {
  return countryCodes.includes(value as CountryCode)
}

function parseHash(): StandRoute | undefined {
  const [path, query] = window.location.hash.replace(/^#\/?/, '').split('?')
  const [variant, country, caseId] = path.split('/').filter(Boolean)

  if (!isVariant(variant)) {
    return undefined
  }

  const resolvedCountry = isCountry(country) ? country : defaultCountry
  const resolvedCase = isCaseId(caseId) ? caseId : defaultCase
  const requestedLocale = new URLSearchParams(query ?? '').get('locale') ?? undefined

  return {
    variant,
    country: resolvedCountry,
    caseId: resolvedCase,
    // Язык по умолчанию берётся из страны. Переопределение нужно, чтобы
    // проверить локализацию отдельно от набора полей.
    locale: isLocale(requestedLocale) ? requestedLocale : countries[resolvedCountry].locale,
  }
}

// Маршрут общий на всё приложение, поэтому слушатель ставится один раз
// на модуль, а не в каждом компоненте.
const currentRoute = ref<StandRoute | undefined>(parseHash())

window.addEventListener('hashchange', () => {
  currentRoute.value = parseHash()
})

export function routeHref(
  variant: StandVariant,
  country: CountryCode,
  caseId: CaseId,
  locale?: LocaleCode,
): string {
  const base = `#/${variant}/${country}/${caseId}`

  return locale ? `${base}?locale=${locale}` : base
}

export function useStand() {
  const route = computed(() => currentRoute.value)

  const variant = computed(() => currentRoute.value?.variant)
  const country = computed(() => currentRoute.value?.country ?? defaultCountry)
  const locale = computed(() => currentRoute.value?.locale ?? countries[defaultCountry].locale)

  const countryConfig = computed(() => countries[country.value])
  const caseConfig = computed<CaseConfig>(() => cases[currentRoute.value?.caseId ?? defaultCase])

  const isModal = computed(() => variant.value === 'modal')
  const isInline = computed(() => variant.value === 'inline')
  const isProd = computed(() => variant.value === 'prod')

  /** Панель модератора и вкладка кейсов показываются только по ?debug=1. */
  const isDebug = computed(() => window.location.search.includes('debug=1'))

  const t = (key: string) => translate(locale.value, country.value, key)

  return {
    route,
    variant,
    country,
    locale,
    countryConfig,
    caseConfig,
    isModal,
    isInline,
    isProd,
    isDebug,
    t,
  }
}
