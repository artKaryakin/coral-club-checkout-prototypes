import { computed, ref } from 'vue'

import bLuronImg from '@/assets/products/b-luron.png'
import coralDetoxPlusImg from '@/assets/products/coral-detox-plus.png'
import dSprayImg from '@/assets/products/d-spray.png'
import ultimateMaxImg from '@/assets/products/ultimate-max.png'
import { formatDecimal, formatPrice, formatPriceRounded } from '@/utils/formatPrice'

import { useVariant } from './useVariant'

export type DeliveryMethod = 'courier' | 'pickup'

export type PickupProvider = 'cdek' | 'office' | 'fivepost'

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

export const deliveryMethodLabels: Record<DeliveryMethod, string> = {
  courier: 'Доставка курьером',
  pickup: 'Самовывоз',
}

export const pickupProviderLabels: Record<PickupProvider, string> = {
  cdek: 'Пункт самовывоза СДЭК',
  office: 'Бесплатный самовывоз из офиса компании',
  fivepost: 'Пункт самовывоза 5Post',
}

/**
 * Центр карты по умолчанию — Москва
 */
export const defaultMapCenter = { lat: 55.7522, lng: 37.6156 }

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

// ─── Данные-заглушки ─────────────────────────────────────────────────────────
// В реальном проекте приходят из API: useApiData<PickupPoints>('...') из пакета `ui`.
// Коды пунктов, телефоны СДЭК и координаты — демонстрационные, координаты
// проставлены приблизительно по названиям улиц.
// ─────────────────────────────────────────────────────────────────────────────
const pickupPoints: PickupPoint[] = [
  {
    id: 'office-horoshevskoe',
    provider: 'office',
    name: 'Бесплатный самовывоз из офиса компании',
    address: 'Москва, Хорошевское шоссе, д.32, корп. 2',
    price: 0,
    code: '11ВЭ',
    phone: '+7 495 797-42-81',
    note: 'Забрать заказ из офиса продаж можно сразу после оформления',
    lat: 55.7789,
    lng: 37.5232,
  },
  {
    id: 'office-stanislavskogo',
    provider: 'office',
    name: 'Бесплатный самовывоз из офиса компании',
    address: 'Москва, ул. Станиславского, 11',
    price: 0,
    code: '11ВЖ',
    phone: '+7 495 797-42-81',
    note: 'Забрать заказ из офиса продаж можно сразу после оформления',
    lat: 55.7411,
    lng: 37.6642,
  },
  {
    id: 'cdek-vinogradova',
    provider: 'cdek',
    name: 'Пункт самовывоза СДЭК',
    address: 'Москва, ул. Академика Виноградова, 5',
    price: 0,
    code: 'MSK112',
    lat: 55.6167,
    lng: 37.5083,
  },
  {
    id: 'cdek-varshavskoe',
    provider: 'cdek',
    name: 'Пункт самовывоза СДЭК',
    address: 'Москва, ш. Варшавское, 152, к. 1',
    price: 0,
    code: 'MSK274',
    lat: 55.6153,
    lng: 37.6045,
  },
  {
    id: 'cdek-rudnevka',
    provider: 'cdek',
    name: 'Пункт самовывоза СДЭК',
    address: 'Москва, ул. Руднёвка, 14',
    price: 0,
    code: 'MSK318',
    lat: 55.7167,
    lng: 37.8833,
  },
  {
    id: 'cdek-kondiva-orlova',
    provider: 'cdek',
    name: 'Пункт самовывоза СДЭК',
    address: 'Москва, ул. Кондива Орлова, 4',
    price: 0,
    code: 'MSK405',
    lat: 55.8833,
    lng: 37.6167,
  },
]

// Профили адресной книги — заглушка, в реальном проекте приходят из API
// (cc3-library-user, судя по документации ДС). Данные повторяют карточки
// из QA-аккаунта: те же ФИО и адреса, что и в остальных сценариях чекаута.
//
// Это полный список «как у вернувшегося пользователя». Что из него реально
// доступно, решает профиль прототипа — см. savedAddressBookEntries ниже.
const addressBookEntries: AddressBookEntry[] = [
  {
    id: 'book-courier-berezovoy',
    method: 'courier',
    badge: 'Последний адрес',
    fullName: 'Иванов Иван',
    phone: '+7 999-111-22-33',
    email: 'qa.auto.checkout+ru@example.com',
    city: 'Москва, Москва',
    addressLine: 'Берёзовой Рощи проспект, 12, Москва, Россия, 125252',
    address: {
      search: 'Берёзовой Рощи проспект',
      houseNumber: '12',
      apartment: '',
      floor: '',
      entrance: '',
      intercom: '',
      postalCode: '125252',
      district: '',
    },
    methodLabel: 'Курьер',
    price: 1349,
  },
  {
    id: 'book-pickup-stanislavskogo',
    method: 'pickup',
    fullName: 'Крым индекс ТЕСТОВЫЙ ЗАКАЗ',
    phone: '+7 999-111-22-33',
    email: 'qa.auto.checkout+ru@example.com',
    city: 'Москва, Москва',
    addressLine: 'ул. Станиславского, 11, п/а, Москва, Россия, 109004',
    pickupPointId: 'office-stanislavskogo',
    methodLabel: 'Бесплатный самовывоз из офиса компании',
    price: 0,
  },
  {
    id: 'book-pickup-horoshevskoe',
    method: 'pickup',
    fullName: 'Тест Тестовииич Тест',
    phone: '+7 999-111-22-33',
    email: 'qa.auto.checkout+ru@example.com',
    city: 'Москва, Москва',
    addressLine: 'Хорошевское шоссе, д.32, корп. 2, п/а, Москва, Россия, 123007',
    pickupPointId: 'office-horoshevskoe',
    methodLabel: 'Бесплатный самовывоз из офиса компании',
    price: 0,
  },
]

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
const city = ref('Москва, Москва')
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
  const { hasAddressBook } = useVariant()

  /**
   * Сохранённые адреса есть только в сценарии повторного входа. У нового
   * пользователя список пустой — значит, нет ни адресной книги, ни выбора
   * из сохранённого, только ручной ввод.
   */
  const savedAddressBookEntries = computed(() =>
    hasAddressBook.value ? addressBookEntries : [],
  )

  const selectedPickupPoint = computed(() =>
    pickupPoints.find((point) => point.id === selectedPickupPointId.value),
  )

  const pickupPointsFormat = computed<PickupPointFormat[]>(() => {
    const search = pickupSearch.value.trim().toLowerCase()

    return pickupPoints
      .filter((point) => {
        const byProvider =
          pickupProviders.value.length === 0 || pickupProviders.value.includes(point.provider)
        const bySearch =
          search === '' ||
          point.address.toLowerCase().includes(search) ||
          point.name.toLowerCase().includes(search)

        return byProvider && bySearch
      })
      .map((point) => ({ ...point, priceFormat: formatPrice(point.price) }))
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

  const summary = computed(() => ({
    itemsCount: order.itemsCount,
    itemsTotalFormat: formatPrice(order.itemsTotal),
    points: order.points,
    walletUsedFormat:
      walletAppliedAmount.value > 0 ? formatDecimal(walletAppliedAmount.value) : undefined,
    deliveryFormat: formatPrice(order.delivery),
    totalFormat: formatPrice(Math.max(0, order.total - walletAppliedAmount.value)),
    pickupCode: isPickup.value ? selectedPickupPoint.value?.code : undefined,
  }))

  const orderProductsFormat = computed(() =>
    orderProducts.map((product) => ({
      ...product,
      priceFormat: formatPrice(product.price),
    })),
  )

  // Первые 3 товара — для превью-ряда в заголовке сводки, остальное — «+N».
  const orderProductsPreview = computed(() => orderProductsFormat.value.slice(0, 3))
  const orderProductsMoreCount = computed(() =>
    Math.max(0, orderProductsFormat.value.length - orderProductsPreview.value.length),
  )

  const walletDisplayBalanceFormat = computed(() =>
    formatPriceRounded(walletBalance - walletAppliedAmount.value),
  )

  const walletMaxUsableFormat = computed(() => formatPriceRounded(walletMaxUsable.value))
  const walletAppliedAmountFormat = computed(() => formatPriceRounded(walletAppliedAmount.value))
  const walletRemainingToPayFormat = computed(() => formatPriceRounded(walletRemainingToPay.value))

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
    const entry = addressBookEntries.find((item) => item.id === entryId)

    if (!entry) {
      return
    }

    Object.assign(recipient.value, splitFullName(entry.fullName), {
      phone: entry.phone,
      email: entry.email,
    })
    city.value = entry.city
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
    city.value = ''
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
  city.value = 'Москва, Москва'
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
