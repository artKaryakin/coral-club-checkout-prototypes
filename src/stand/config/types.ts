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
  | 'lookup'
  | 'street'
  | 'house'
  | 'apartment'
  | 'postal'
  | 'city'
  | 'region'
  | 'country'
  | 'recipientName'
  | 'recipientPhone'
  | 'recipientEmail'

export type FieldType = 'text' | 'select' | 'autocomplete' | 'phone' | 'email'

export type FieldGroup = 'address' | 'recipient'

/** Как поле описано в конфиге страны. */
export interface FieldConfig {
  key: FieldKey
  type?: FieldType
  required?: boolean
  /** Заполняется автоматически по индексу или из подсказки, вручную не вводится. */
  autofilled?: boolean
}

/** Готовое к рендеру поле — то, что получает вариант интерфейса. */
export interface StandField {
  key: FieldKey
  type: FieldType
  label: string
  autocomplete: string
  required: boolean
  autofilled: boolean
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

/** Заполненные поля адреса — только для курьерской доставки. */
export interface StandAddressFields {
  search: string
  houseNumber: string
  apartment: string
  floor: string
  entrance: string
  intercom: string
  postalCode: string
  district: string
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
  /** Провайдер подсказок адресов для этой страны. */
  provider: 'dadata' | 'loqate' | 'google' | 'twogis'
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
  lookup: 'off',
  street: 'address-line1',
  house: 'address-line1',
  apartment: 'address-line2',
  postal: 'postal-code',
  city: 'address-level2',
  region: 'address-level1',
  country: 'country-name',
  recipientName: 'name',
  recipientPhone: 'tel',
  recipientEmail: 'email',
}

export const defaultTypeByKey: Record<FieldKey, FieldType> = {
  lookup: 'autocomplete',
  street: 'text',
  house: 'text',
  apartment: 'text',
  postal: 'text',
  city: 'text',
  region: 'text',
  country: 'text',
  recipientName: 'text',
  recipientPhone: 'phone',
  recipientEmail: 'email',
}
