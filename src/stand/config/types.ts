/**
 * Типы ядра стенда.
 *
 * Состав и порядок полей адресной формы задаются здесь и в countries.ts,
 * а не вёрсткой вариантов. Вариант (Modal / Inline / Prod) получает готовый
 * список полей и только оформляет его.
 */

export type CountryCode = 'ru' | 'kz' | 'de' | 'pl' | 'cz' | 'us'

export type LocaleCode = 'ru' | 'en' | 'de' | 'pl' | 'cs'

export type FieldKey =
  | 'addressLabel'
  | 'street'
  | 'house'
  | 'apartment'
  | 'entrance'
  | 'floor'
  | 'intercom'
  | 'postal'
  | 'city'
  | 'region'
  | 'comment'
  | 'recipientName'
  | 'recipientFirstName'
  | 'recipientLastName'
  | 'recipientPhone'
  | 'recipientEmail'

export type FieldType =
  | 'text'
  | 'select'
  | 'autocomplete'
  | 'phone'
  | 'email'
  | 'textarea'
  /** Набор взаимоисключающих кнопок — «Дом / Работа / Своё название». */
  | 'chips'

export type FieldGroup = 'address' | 'recipient'

/** Как поле описано в конфиге страны. */
export interface FieldConfig {
  key: FieldKey
  type?: FieldType
  required?: boolean
  /** Заполняется автоматически по индексу или из подсказки, вручную не вводится. */
  autofilled?: boolean
  /**
   * Подставляется из подсказки, но остаётся обычным полем: значение можно
   * дописать и исправить, формат не проверяется. Отличается от autofilled
   * тем, что подсказка может ничего не вернуть — тогда пользователь вводит
   * значение сам, и поле не должно ему мешать.
   */
  prefilled?: boolean
  /** Своя ширина в сетке варианта: половина строки вместо целой. */
  half?: boolean
}

/** Готовое к рендеру поле — то, что получает вариант интерфейса. */
export interface StandField {
  key: FieldKey
  type: FieldType
  label: string
  /** Подсказка внутри поля — местный формат адреса, а не «введите значение». */
  placeholder: string
  autocomplete: string
  required: boolean
  autofilled: boolean
  prefilled: boolean
  half: boolean
  options?: { value: string; label: string }[]
}

/** Служба, которой принадлежит пункт выдачи. */
export type PickupProviderCode =
  | 'office'
  | 'cdek'
  | 'fivepost'
  | 'kazpost'
  | 'dhl'
  | 'inpost'
  | 'zasilkovna'
  | 'usps'

/** Пункт выдачи — данные приходят из ядра, визуал рисует вариант. */
export interface StandPickupPoint {
  id: string
  provider: PickupProviderCode
  address: string
  price: number
  code: string
  phone: string
  lat: number
  lng: number
}

/**
 * Заполненные поля адреса — только для курьерской доставки.
 * Ключи совпадают с FieldKey: это те же поля, но со значениями.
 */
export interface StandAddressFields {
  addressLabel: string
  street: string
  /** Отдельным полем только там, где так принято вводить адрес. */
  house?: string
  apartment: string
  entrance: string
  floor: string
  intercom: string
  postal: string
  city: string
  region: string
  comment: string
}

/**
 * Карточка адресной книги. Тексты хранятся ключами, а не готовыми
 * строками: одна и та же карточка показывается на языке своей страны.
 */
export interface StandAddress {
  id: string
  method: 'courier' | 'pickup'
  /** Ключ подписи способа доставки внизу карточки. */
  methodKey: string
  /** Ключ бейджа над карточкой, например «Последний адрес». */
  badgeKey?: string
  recipientName: string
  phone: string
  email: string
  city: string
  addressLine: string
  address?: StandAddressFields
  pickupPointId?: string
  price: number
}

export interface CountryConfig {
  code: CountryCode
  locale: LocaleCode
  /** Эмодзи-флаг рядом с полем телефона. */
  flag: string
  /** Валюта и локаль форматирования сумм — цены не должны быть в рублях везде. */
  currency: string
  intlLocale: string
  /** Город по умолчанию и центр карты — на старте показывается он. */
  city: string
  mapCenter: { lat: number; lng: number }
  /**
   * Провайдер подсказок адресов для этой страны.
   *
   * Значение целевое, для прода. На стенде живая реализация пока одна —
   * бесплатный слой photon (OSM); остальные коды подставляют её же, пока
   * не появится ключ. Смена провайдера для страны — правка одной строки.
   */
  provider: 'dadata' | 'loqate' | 'google' | 'twogis' | 'photon'
  address: FieldConfig[]
  recipient: FieldConfig[]
  /** Варианты для полей типа select (регионы, штаты). */
  regions?: { value: string; label: string }[]
}

/**
 * Значение autocomplete-атрибута для каждого поля.
 * Нужно, чтобы работало нативное автозаполнение браузера — на части рынков
 * это заметно быстрее ручного ввода и меньше опечаток.
 */
export const autocompleteByKey: Record<FieldKey, string> = {
  addressLabel: 'off',
  street: 'address-line1',
  house: 'address-line1',
  apartment: 'address-line2',
  entrance: 'off',
  floor: 'off',
  intercom: 'off',
  postal: 'postal-code',
  city: 'address-level2',
  region: 'address-level1',
  comment: 'off',
  recipientName: 'name',
  recipientFirstName: 'given-name',
  recipientLastName: 'family-name',
  recipientPhone: 'tel',
  recipientEmail: 'email',
}

export const defaultTypeByKey: Record<FieldKey, FieldType> = {
  addressLabel: 'chips',
  street: 'autocomplete',
  house: 'text',
  apartment: 'text',
  entrance: 'text',
  floor: 'text',
  intercom: 'text',
  postal: 'text',
  city: 'text',
  region: 'text',
  comment: 'textarea',
  recipientName: 'text',
  recipientFirstName: 'text',
  recipientLastName: 'text',
  recipientPhone: 'phone',
  recipientEmail: 'email',
}
