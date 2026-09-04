import { computed, ref } from 'vue'

/**
 * Прототип различается по двум независимым осям:
 *
 * 1. variant — как устроен интерфейс (три прототипа на тестирование);
 * 2. profile — с какими данными пришёл пользователь.
 *
 * Обе оси читаются из адреса вида `#/modal/returning`, поэтому каждую
 * комбинацию можно открыть по прямой ссылке и отправить тестировщику.
 * Роутер для этого не нужен: маршрутов ровно шесть и они статичные.
 */
export type CheckoutVariant = 'prod' | 'modal' | 'inline'

export type CheckoutProfile = 'new' | 'returning'

export type CheckoutRoute = {
  variant: CheckoutVariant
  profile: CheckoutProfile
}

export const checkoutVariants: CheckoutVariant[] = ['prod', 'modal', 'inline']

export const checkoutProfiles: CheckoutProfile[] = ['new', 'returning']

export const checkoutVariantLabels: Record<CheckoutVariant, string> = {
  prod: 'Прод',
  modal: 'Модальный',
  inline: 'Инлайн',
}

export const checkoutProfileLabels: Record<CheckoutProfile, string> = {
  new: 'Новый пользователь — без сохранённых адресов',
  returning: 'Повторный вход — с адресной книгой',
}

function isVariant(value: string | undefined): value is CheckoutVariant {
  return checkoutVariants.includes(value as CheckoutVariant)
}

function isProfile(value: string | undefined): value is CheckoutProfile {
  return checkoutProfiles.includes(value as CheckoutProfile)
}

function parseHash(): CheckoutRoute | undefined {
  const [variant, profile] = window.location.hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)

  if (!isVariant(variant) || !isProfile(profile)) {
    return undefined
  }

  return { variant, profile }
}

// Маршрут общий на всё приложение, поэтому слушатель ставится один раз
// на модуль, а не в каждом компоненте.
const currentRoute = ref<CheckoutRoute | undefined>(parseHash())

window.addEventListener('hashchange', () => {
  currentRoute.value = parseHash()
})

export function routeHref(variant: CheckoutVariant, profile: CheckoutProfile): string {
  return `#/${variant}/${profile}`
}

export function useVariant() {
  const route = computed(() => currentRoute.value)

  const variant = computed(() => currentRoute.value?.variant)
  const profile = computed(() => currentRoute.value?.profile)

  /**
   * Адресная книга есть только у вернувшегося пользователя. У нового
   * профиля она пустая — и сценарий выбора сохранённого адреса недоступен.
   */
  const hasAddressBook = computed(() => currentRoute.value?.profile === 'returning')

  const isModal = computed(() => currentRoute.value?.variant === 'modal')
  const isInline = computed(() => currentRoute.value?.variant === 'inline')

  return { route, variant, profile, hasAddressBook, isModal, isInline }
}
