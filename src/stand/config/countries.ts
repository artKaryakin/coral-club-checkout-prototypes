import type { CountryCode, CountryConfig } from './types'
import { usStates } from './usStates'

/**
 * Набор и ПОРЯДОК полей по странам — в формате, привычном для рынка.
 *
 * Форма не переводится с русского на другие языки, а собирается заново под
 * каждый рынок. Три образца, на которые ориентировались:
 *
 *  - RU/KZ — курьерская доставка по городу: адрес одной строкой, дальше
 *    квартира, подъезд, этаж и домофон. Улица отдельным полем не выносится —
 *    так её не вводят ни в одном из привычных сервисов; в России рядом со
 *    строкой адреса стоит отдельное поле дома, его требует доставка;
 *  - DE/PL/CZ — почтовая доставка: строка адреса, необязательная квартира,
 *    индекс и город. Имя и фамилия — отдельные поля, «отчества» нет;
 *  - US — то же самое плюс штат отдельным селектом.
 *
 * Два правила, общие для всех рынков:
 *  1. Строка адреса с подсказками — первый элемент формы.
 *  2. Индекс стоит ВЫШЕ города и региона, а город и регион заполняются
 *     автоматически и вручную не вводятся. Это и есть предмет редизайна:
 *     ручной ввод города — самая дорогая ошибка в текущей форме.
 *
 * Порядок массива = порядок полей на экране. Менять порядок для страны —
 * правка одной строки здесь, во всех вариантах интерфейса сразу.
 */

/** Курьерская доставка по городу — базовый набор для рынков СНГ. */
const cisAddress: CountryConfig['address'] = [
  { key: 'addressLabel' },
  { key: 'street', required: true },
  { key: 'apartment', half: true },
  { key: 'entrance', half: true },
  { key: 'floor', half: true },
  { key: 'intercom', half: true },
  { key: 'postal', autofilled: true, required: true, half: true },
  { key: 'city', autofilled: true, required: true, half: true },
]

/**
 * Россия — тот же набор, но с домом отдельным полем.
 *
 * Дом остаётся и внутри строки адреса: её пользователь узнаёт целиком,
 * как в привычных сервисах. Отдельное поле нужно доставке, поэтому оно
 * подставляется из выбранной подсказки, но остаётся обычным полем —
 * дом можно дописать («43к2», «12 стр. 1»), формат не проверяется.
 *
 * Индекс здесь тоже prefilled, а не autofilled: в OSM почтовый индекс
 * заполнен не везде, и запирать поле, которое подсказка может не отдать,
 * нельзя — пользователь останется без возможности ввести его руками.
 *
 * Отдельного поля города нет: город всегда стоит в начале строки адреса —
 * «Москва, ул. Москворечье, 43». Второе поле с тем же значением удлиняет
 * форму и заставляет следить, совпадают ли они между собой.
 */
const ruAddress: CountryConfig['address'] = [
  { key: 'addressLabel' },
  { key: 'street', required: true },
  { key: 'house', required: true, prefilled: true, half: true },
  { key: 'apartment', half: true },
  { key: 'entrance', half: true },
  { key: 'floor', half: true },
  { key: 'intercom', half: true },
  { key: 'postal', required: true, prefilled: true, half: true },
]

const cisRecipient: CountryConfig['recipient'] = [
  { key: 'recipientName', required: true },
  { key: 'recipientPhone', required: true },
  { key: 'recipientEmail', required: true },
]

/** Почтовая доставка в Европе: строка адреса, квартира, индекс, город. */
const euAddress: CountryConfig['address'] = [
  { key: 'street', required: true },
  { key: 'apartment' },
  { key: 'postal', required: true, half: true },
  { key: 'city', autofilled: true, required: true, half: true },
]

/** В Европе и США имя и фамилия — разные поля, отчества нет. */
const euRecipient: CountryConfig['recipient'] = [
  { key: 'recipientFirstName', required: true, half: true },
  { key: 'recipientLastName', required: true, half: true },
  { key: 'recipientPhone', required: true },
  { key: 'recipientEmail', required: true },
]

export const countries: Record<CountryCode, CountryConfig> = {
  ru: {
    code: 'ru',
    flag: '🇷🇺',
    currency: 'RUB',
    intlLocale: 'ru-RU',
    city: 'Москва',
    mapCenter: { lat: 55.7522, lng: 37.6156 },
    locale: 'ru',
    provider: 'dadata',
    address: ruAddress,
    recipient: cisRecipient,
  },

  kz: {
    code: 'kz',
    flag: '🇰🇿',
    currency: 'KZT',
    intlLocale: 'ru-KZ',
    city: 'Алматы',
    mapCenter: { lat: 43.2389, lng: 76.8897 },
    locale: 'ru',
    provider: 'twogis',
    address: cisAddress,
    recipient: cisRecipient,
  },

  de: {
    code: 'de',
    flag: '🇩🇪',
    currency: 'EUR',
    intlLocale: 'de-DE',
    city: 'Berlin',
    mapCenter: { lat: 52.52, lng: 13.405 },
    locale: 'de',
    provider: 'loqate',
    address: euAddress,
    recipient: euRecipient,
  },

  pl: {
    code: 'pl',
    flag: '🇵🇱',
    currency: 'PLN',
    intlLocale: 'pl-PL',
    city: 'Warszawa',
    mapCenter: { lat: 52.2297, lng: 21.0122 },
    locale: 'pl',
    provider: 'loqate',
    address: euAddress,
    recipient: euRecipient,
  },

  cz: {
    code: 'cz',
    flag: '🇨🇿',
    currency: 'CZK',
    intlLocale: 'cs-CZ',
    city: 'Praha',
    mapCenter: { lat: 50.0755, lng: 14.4378 },
    locale: 'cs',
    provider: 'loqate',
    address: euAddress,
    recipient: euRecipient,
  },

  us: {
    code: 'us',
    flag: '🇺🇸',
    currency: 'USD',
    intlLocale: 'en-US',
    city: 'New York',
    mapCenter: { lat: 40.7128, lng: -74.006 },
    locale: 'en',
    provider: 'loqate',
    // Номер дома входит в строку адреса — отдельного поля «дом» нет.
    // Город и штат выводятся из ZIP и вручную не вводятся.
    address: [
      { key: 'street', required: true },
      { key: 'apartment' },
      { key: 'postal', required: true, half: true },
      { key: 'city', autofilled: true, required: true, half: true },
      { key: 'region', type: 'select', autofilled: true, required: true },
    ],
    recipient: euRecipient,
    regions: usStates,
  },
}

export const countryCodes = Object.keys(countries) as CountryCode[]

export const defaultCountry: CountryCode = 'ru'
