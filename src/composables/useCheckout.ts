import { computed, ref, watch } from 'vue'

import bLuronImg from '@/assets/products/b-luron.png'
import coralDetoxPlusImg from '@/assets/products/coral-detox-plus.png'
import dSprayImg from '@/assets/products/d-spray.png'
import ultimateMaxImg from '@/assets/products/ultimate-max.png'
import { formatDecimal, formatPrice, formatPriceRounded } from '@/utils/formatPrice'

import { addressBook } from '@/stand/config/addresses'
import { pickupPoints as standPickupPoints } from '@/stand/config/pickupPoints'
import type { PickupProviderCode, StandAddressFields } from '@/stand/config/types'
import { useStand } from '@/stand/composables/useStand'

export type DeliveryMethod = 'courier' | 'pickup'

export type PickupProvider = PickupProviderCode

export type PickupView = 'map' | 'list'

export type PickupPoint = {
  id: string

  /**
   * Служба, которой принадлежит пункт
   */
  provider: PickupProvider

  /**
   * Название пункта, как его показывает служба доставки
   */
  name: string

  /**
   * Адрес одной строкой
   */
  address: string

  /**
   * Стоимость доставки до пункта
   */
  price: number

  /**
   * Код пункта выдачи, попадает в состав заказа
   */
  code: string

  /**
   * Координаты для отображения на карте
   */
  lat: number
  lng: number

  /**
   * Телефон пункта. Есть не у всех служб
   */
  phone?: string

  /**
   * Пояснение к порядку получения заказа
   */
  note?: string
}

export type PickupPointFormat = PickupPoint & {
  priceFormat: string
}

/**
 * Подписи способов доставки, названия служб и центр карты зависят от страны
 * и языка, поэтому они больше не константы модуля — их отдаёт useCheckout().
 */

export type Recipient = {
  lastName: string
  firstName: string
  middleName: string
  phone: string
  email: string
}

export type DeliveryAddress = {
  search: string
  houseNumber: string
  apartment: string
  floor: string
  entrance: string
  intercom: string
  postalCode: string
  district: string
}

export type AddressBookEntry = {
  id: string
  method: DeliveryMethod

  /**
   * Бейдж над карточкой, например «Последний адрес»
   */
  badge?: string

  /**
   * ФИО одной строкой, как оно хранится в адресной книге.
   * При выборе разбирается на Фамилию/Имя/Отчество по пробелам.
   */
  fullName: string

  phone: string
  email: string

  city: string

  /**
   * Адрес одной строкой — только для отображения в карточке
   */
  addressLine: string

  /**
   * Заполненные поля адреса — только для способа courier
   */
  address?: DeliveryAddress

  /**
   * Значения полей адреса в том виде, в каком их задаёт конфиг страны.
   * Нужны вариантам, которые строят форму через useStandFields.
   */
  fields?: StandAddressFields

  /**
   * Пункт самовывоза — только для способа pickup
   */
  pickupPointId?: string

  /**
   * Подпись способа доставки внизу карточки
   */
  methodLabel: string

  /**
   * Стоимость доставки по этому профилю — показывается в правом нижнем
   * углу карточки.
   */
  price: number
}

export type OrderProduct = {
  id: string
  name: string
  price: number
  quantity: number

  /**
   * Реальное фото товара — референс, добавленный вручную в
   * design-references/desktop/blocks/. Если фото для товара нет,
   * используется заглушка (две буквы + цвет), см. thumbInitials/thumbColor.
   */
  thumbImage?: string
  thumbInitials: string
  thumbColor: string
}

// Состав заказа — заглушка, в реальном проекте приходит с бэкенда.
// Названия товаров подобраны под 4 реальных фото, которые прислали для
// самери/дровера — так у каждой позиции есть настоящая картинка, а не
// смесь фото и цветных кружков.
const orderProducts: OrderProduct[] = [
  {
    id: 'b-luron',
    name: 'B-Luron',
    price: 1200,
    quantity: 2,
    thumbImage: bLuronImg,
    thumbInitials: 'BL',
    thumbColor: '#c9a15a',
  },
  {
    id: 'coral-detox-plus',
    name: 'Coral Detox Plus',
    price: 4899,
    quantity: 1,
    thumbImage: coralDetoxPlusImg,
    thumbInitials: 'CD',
    thumbColor: '#e0518f',
  },
  {
    id: 'd-spray',
    name: 'D-Spray',
    price: 1200,
    quantity: 1,
    thumbImage: dSprayImg,
    thumbInitials: 'DS',
    thumbColor: '#d9a441',
  },
  {
    id: 'ultimate-max',
    name: 'Ultimate Max',
    price: 1200,
    quantity: 2,
    thumbImage: ultimateMaxImg,
    thumbInitials: 'UM',
    thumbColor: '#e07a2e',
  },
]

const order = {
  itemsCount: orderProducts.reduce((sum, item) => sum + item.quantity, 0),
  itemsTotal: orderProducts.reduce((sum, item) => sum + item.price * item.quantity, 0),
  points: '48,00',
  delivery: 200,
  get total() {
    return this.itemsTotal + this.delivery
  },
}

export type WalletMode = 'idle' | 'custom' | 'applied'

const walletBalance = 73579.1

function emptyRecipient(): Recipient {
  return { lastName: '', firstName: '', middleName: '', phone: '', email: '' }
}

function emptyAddress(): DeliveryAddress {
  return {
    search: '',
    houseNumber: '',
    apartment: '',
    floor: '',
    entrance: '',
    intercom: '',
    postalCode: '',
    district: '',
  }
}

/**
 * Разбирает «Фамилия Имя Отчество» на отдельные поля.
 * Порядок слов совпадает с порядком полей в форме получателя.
 */
function splitFullName(fullName: string): Pick<Recipient, 'lastName' | 'firstName' | 'middleName'> {
  const [lastName = '', firstName = '', ...rest] = fullName.trim().split(/\s+/)

  return { lastName, firstName, middleName: rest.join(' ') }
}

// ─── Состояние ───────────────────────────────────────────────────────────────
const deliveryMethod = ref<DeliveryMethod>('courier')
const pickupView = ref<PickupView>('list')
const pickupSearch = ref('')
const pickupProviders = ref<PickupProvider[]>([])
const selectedPickupPointId = ref<string>()

const recipient = ref<Recipient>(emptyRecipient())
// Пустая строка означает «пользователь ничего не вводил» — тогда
// показывается город страны из конфига стенда, см. useCheckout().
const cityInput = ref('')
const deliveryAddress = ref<DeliveryAddress>(emptyAddress())

const isAddressBookOpen = ref(false)

const walletMode = ref<WalletMode>('idle')
const walletCustomAmount = ref('')

/**
 * Реально применённая скидка. 0, пока скидка не применена.
 */
const walletAppliedAmount = ref(0)

const orderComment = ref('')
const acceptMarketing = ref(true)
const acceptTerms = ref(true)

/**
 * Открыт ли полный список товаров: на десктопе — это выдвижная панель
 * (drawer), на мобильном — разворачивание прямо внутри блока сводки.
 * Общий флаг, форма показа зависит от ширины экрана (см. Cc3CheckoutSummary.vue).
 */
const isSummaryDetailsOpen = ref(false)

// Промокод — только визуальный элемент. Реальной проверки кодов нет:
// мы не знаем бизнес-правил скидок, поэтому кнопка ничего не применяет.
const promoCode = ref('')

export function useCheckout() {
  const { hasSavedAddresses, country, countryConfig, t } = useStand()

  // Смена страны или типа пользователя в адресе — это новая конфигурация
  // стенда: открытая адресная книга и выбранный пункт от предыдущей
  // остаться не должны.
  watch([country, hasSavedAddresses], () => {
    isAddressBookOpen.value = false
    selectedPickupPointId.value = undefined
    cityInput.value = ''
  })

  /**
   * Наполнение адресной книги задаёт тип пользователя — вторая ось стенда.
   * Прежние оси profile (new / returning) и кейс этим поглощаются.
   */
  const hasAddressBook = hasSavedAddresses

  /** Центр карты и город по умолчанию берутся из страны, а не из Москвы. */
  const mapCenter = computed(() => countryConfig.value.mapCenter)

  const city = computed({
    get: () => cityInput.value || countryConfig.value.city,
    set: (value: string) => {
      cityInput.value = value
    },
  })

  const deliveryMethodLabels = computed<Record<DeliveryMethod, string>>(() => ({
    courier: t('delivery.courier.title'),
    pickup: t('delivery.pickup.title'),
  }))

  const pickupProviderLabels = computed(
    () =>
      Object.fromEntries(
        standPickupPoints[country.value].map((point) => [
          point.provider,
          t(`pickup.provider.${point.provider}`),
        ]),
      ) as Record<PickupProvider, string>,
  )

  /**
   * Пункты выдачи текущей страны. Названия служб и пояснения приходят
   * из локализации — сами точки лежат в ядре стенда.
   */
  const pickupPoints = computed<PickupPoint[]>(() =>
    standPickupPoints[country.value].map((point) => ({
      ...point,
      name: t(`pickup.provider.${point.provider}`),
      note: point.provider === 'office' ? t('pickup.note.office') : t('pickup.note.point'),
    })),
  )

  /**
   * Полная адресная книга страны: три курьерских адреса, два пункта выдачи
   * и офис компании. Что из неё доступно, решает тип пользователя.
   */
  const countryAddressBook = computed<AddressBookEntry[]>(() =>
    addressBook[country.value].map((entry) => ({
      id: entry.id,
      method: entry.method,
      badge: entry.badgeKey ? t(entry.badgeKey) : undefined,
      fullName: entry.recipientName,
      phone: entry.phone,
      email: entry.email,
      city: entry.city,
      addressLine: entry.addressLine,
      // Прод-версия держит свой набор полей: она пока не переведена
      // на конфиг страны. Раскладываем значения ядра в её форму.
      address: entry.address && {
        search: entry.address.street,
        houseNumber: '',
        apartment: entry.address.apartment,
        floor: entry.address.floor,
        entrance: entry.address.entrance,
        intercom: entry.address.intercom,
        postalCode: entry.address.postal,
        district: '',
      },
      fields: entry.address,
      pickupPointId: entry.pickupPointId,
      methodLabel: t(entry.methodKey),
      price: entry.price,
    })),
  )

  /**
   * Сохранённые адреса есть только у пользователя с адресной книгой.
   * У нового список пустой — значит, нет ни книги, ни выбора из
   * сохранённого, только ручной ввод.
   */
  const savedAddressBookEntries = computed(() =>
    hasAddressBook.value ? countryAddressBook.value : [],
  )

  const selectedPickupPoint = computed(() =>
    pickupPoints.value.find((point) => point.id === selectedPickupPointId.value),
  )

  const pickupPointsFormat = computed<PickupPointFormat[]>(() => {
    const search = pickupSearch.value.trim().toLowerCase()

    return pickupPoints.value
      .filter((point) => {
        const byProvider =
          pickupProviders.value.length === 0 || pickupProviders.value.includes(point.provider)
        const bySearch =
          search === '' ||
          point.address.toLowerCase().includes(search) ||
          point.name.toLowerCase().includes(search)

        return byProvider && bySearch
      })
      .map((point) => ({ ...point, priceFormat: money(point.price) }))
  })

  const isPickup = computed(() => deliveryMethod.value === 'pickup')

  const isReady = computed(() => {
    if (!acceptTerms.value) {
      return false
    }

    return isPickup.value ? selectedPickupPointId.value !== undefined : true
  })

  // Сколько максимум можно списать с Coral Wallet: не больше баланса
  // и не больше суммы, которую вообще нужно оплатить за заказ.
  const walletMaxUsable = computed(() => Math.max(0, Math.min(walletBalance, order.total)))

  // Может ли баланс в принципе закрыть весь заказ — определяет формулировку
  // в состоянии «скидка ещё не применена» («скидка 100%» против «скидка до X»).
  const isWalletFullyCovering = computed(() => walletMaxUsable.value >= order.total)

  const walletRemainingToPay = computed(() =>
    Math.max(0, order.total - walletAppliedAmount.value),
  )

  // Покрывает ли весь заказ именно применённая сумма — не то же самое,
  // что isWalletFullyCovering: баланса может хватать на всё, а применили частично.
  const isOrderFullyPaidByWallet = computed(
    () => walletAppliedAmount.value > 0 && walletRemainingToPay.value <= 0,
  )

  const money = (value: number) =>
    formatPrice(value, countryConfig.value.currency, countryConfig.value.intlLocale)

  const moneyRounded = (value: number) =>
    formatPriceRounded(value, countryConfig.value.currency, countryConfig.value.intlLocale)

  const summary = computed(() => ({
    itemsCount: order.itemsCount,
    itemsTotalFormat: money(order.itemsTotal),
    itemsTotalFormatRounded: moneyRounded(order.itemsTotal),
    points: order.points,
    walletUsedFormat:
      walletAppliedAmount.value > 0 ? formatDecimal(walletAppliedAmount.value, countryConfig.value.intlLocale) : undefined,
    walletUsedFormatRounded:
      walletAppliedAmount.value > 0 ? moneyRounded(walletAppliedAmount.value) : undefined,
    deliveryFormat: money(order.delivery),
    deliveryFormatRounded: moneyRounded(order.delivery),
    totalFormat: money(Math.max(0, order.total - walletAppliedAmount.value)),
    totalFormatRounded: moneyRounded(Math.max(0, order.total - walletAppliedAmount.value)),
    pickupCode: isPickup.value ? selectedPickupPoint.value?.code : undefined,
  }))

  const orderProductsFormat = computed(() =>
    orderProducts.map((product) => ({
      ...product,
      priceFormat: money(product.price),
    })),
  )

  // Первые 3 товара — для превью-ряда в заголовке сводки, остальное — «+N».
  const orderProductsPreview = computed(() => orderProductsFormat.value.slice(0, 3))
  const orderProductsMoreCount = computed(() =>
    Math.max(0, orderProductsFormat.value.length - orderProductsPreview.value.length),
  )

  const walletDisplayBalanceFormat = computed(() =>
    moneyRounded(walletBalance - walletAppliedAmount.value),
  )

  const walletMaxUsableFormat = computed(() => moneyRounded(walletMaxUsable.value))
  const walletAppliedAmountFormat = computed(() => moneyRounded(walletAppliedAmount.value))
  const walletRemainingToPayFormat = computed(() => moneyRounded(walletRemainingToPay.value))

  const isWalletCustomAmountValid = computed(() => {
    const amount = Number(walletCustomAmount.value.replace(/\s/g, '').replace(',', '.'))

    return Number.isFinite(amount) && amount > 0 && amount <= walletMaxUsable.value
  })

  function applyWalletFullDiscount() {
    walletAppliedAmount.value = walletMaxUsable.value
    walletMode.value = 'applied'
  }

  function openWalletCustomAmount() {
    walletCustomAmount.value = ''
    walletMode.value = 'custom'
  }

  function applyWalletCustomAmount() {
    if (!isWalletCustomAmountValid.value) {
      return
    }

    const amount = Number(walletCustomAmount.value.replace(/\s/g, '').replace(',', '.'))

    walletAppliedAmount.value = Math.min(amount, walletMaxUsable.value)
    walletMode.value = 'applied'
  }

  function removeWalletDiscount() {
    walletAppliedAmount.value = 0
    walletCustomAmount.value = ''
    walletMode.value = 'idle'
  }

  function selectPickupPoint(id: string) {
    selectedPickupPointId.value = id
  }

  function clearPickupPoint() {
    selectedPickupPointId.value = undefined
  }

  /**
   * Применяет профиль из адресной книги ко всему окружению чекаута:
   * получателю, городу и способу получения (адресу либо пункту самовывоза).
   *
   * Поля объектов recipient/deliveryAddress мутируются на месте (Object.assign),
   * а не переприсваиваются — компоненты формы разбирают их на отдельные refs
   * через toRefs(), и полная замена объекта отвязала бы эти refs от новых данных.
   */
  function applyAddressBookEntry(entryId: string) {
    const entry = countryAddressBook.value.find((item) => item.id === entryId)

    if (!entry) {
      return
    }

    Object.assign(recipient.value, splitFullName(entry.fullName), {
      phone: entry.phone,
      email: entry.email,
    })
    cityInput.value = entry.city
    deliveryMethod.value = entry.method

    if (entry.method === 'courier') {
      Object.assign(deliveryAddress.value, entry.address ?? emptyAddress())
      selectedPickupPointId.value = undefined
    } else {
      Object.assign(deliveryAddress.value, emptyAddress())
      selectedPickupPointId.value = entry.pickupPointId
    }
  }

  /**
   * Сценарий «Новый адрес»: очищает получателя, город и адрес,
   * а способ получения сбрасывает к курьеру по умолчанию — так же,
   * как при первом заходе на чекаут.
   */
  function clearRecipientAndAddress() {
    Object.assign(recipient.value, emptyRecipient())
    cityInput.value = ''
    Object.assign(deliveryAddress.value, emptyAddress())

    deliveryMethod.value = 'courier'
    selectedPickupPointId.value = undefined
    pickupView.value = 'list'
    pickupSearch.value = ''
    pickupProviders.value = []
  }

  function togglePickupProvider(provider: PickupProvider) {
    const index = pickupProviders.value.indexOf(provider)

    if (index === -1) {
      pickupProviders.value = [...pickupProviders.value, provider]
    } else {
      pickupProviders.value = pickupProviders.value.filter((item) => item !== provider)
    }
  }

  return {
    deliveryMethod,
    isPickup,

    mapCenter,
    deliveryMethodLabels,
    pickupProviderLabels,
    formatMoneyRounded: moneyRounded,

    recipient,
    city,
    deliveryAddress,

    isAddressBookOpen,
    savedAddressBookEntries,
    hasAddressBook,
    applyAddressBookEntry,
    clearRecipientAndAddress,

    pickupView,
    pickupSearch,
    pickupProviders,
    pickupPointsFormat,
    selectedPickupPoint,
    selectPickupPoint,
    clearPickupPoint,
    togglePickupProvider,

    walletMode,
    walletCustomAmount,
    isWalletFullyCovering,
    isOrderFullyPaidByWallet,
    isWalletCustomAmountValid,
    walletDisplayBalanceFormat,
    walletMaxUsableFormat,
    walletAppliedAmountFormat,
    walletRemainingToPayFormat,
    applyWalletFullDiscount,
    openWalletCustomAmount,
    applyWalletCustomAmount,
    removeWalletDiscount,

    orderComment,
    acceptMarketing,
    acceptTerms,

    summary,
    orderProductsFormat,
    orderProductsPreview,
    orderProductsMoreCount,
    isSummaryDetailsOpen,
    promoCode,
    isReady,
  }
}

/**
 * Сбрасывает состояние. Нужен для Storybook, чтобы стори не влияли друг на друга.
 */
export function resetCheckout(method: DeliveryMethod = 'courier', pickupPointId?: string) {
  deliveryMethod.value = method
  pickupView.value = 'list'
  pickupSearch.value = ''
  pickupProviders.value = []
  selectedPickupPointId.value = pickupPointId

  Object.assign(recipient.value, emptyRecipient())
  cityInput.value = ''
  Object.assign(deliveryAddress.value, emptyAddress())
  isAddressBookOpen.value = false

  walletMode.value = 'idle'
  walletCustomAmount.value = ''
  walletAppliedAmount.value = 0

  orderComment.value = ''
  acceptMarketing.value = true
  acceptTerms.value = true

  isSummaryDetailsOpen.value = false
  promoCode.value = ''
}
