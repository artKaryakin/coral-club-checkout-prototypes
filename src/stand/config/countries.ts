import type { CountryCode, CountryConfig } from './types'

/**
 * Набор и ПОРЯДОК полей по странам.
 *
 * Два правила, общие для всех рынков:
 *  1. Строка полного автокомплита — первый элемент формы.
 *  2. Почтовый индекс стоит ВЫШЕ города и региона, а город и регион
 *     заполняются автоматически и вручную не вводятся.
 *
 * Порядок массива = порядок полей на экране. Менять порядок для страны —
 * правка одной строки здесь, во всех вариантах интерфейса сразу.
 */
export const countries: Record<CountryCode, CountryConfig> = {
  ru: {
    code: 'ru',
    locale: 'ru',
    provider: 'dadata',
    address: [
      { key: 'lookup' },
      { key: 'street', required: true },
      { key: 'house', required: true },
      { key: 'apartment' },
      { key: 'postal', required: true },
      { key: 'city', autofilled: true, required: true },
    ],
    recipient: [
      { key: 'recipientName', required: true },
      { key: 'recipientPhone', required: true },
      { key: 'recipientEmail' },
    ],
  },

  kz: {
    code: 'kz',
    locale: 'ru',
    provider: 'twogis',
    address: [
      { key: 'lookup' },
      { key: 'street', required: true },
      { key: 'house', required: true },
      { key: 'apartment' },
      { key: 'postal', required: true },
      { key: 'city', autofilled: true, required: true },
    ],
    recipient: [
      { key: 'recipientName', required: true },
      { key: 'recipientPhone', required: true },
      { key: 'recipientEmail' },
    ],
  },

  de: {
    code: 'de',
    locale: 'de',
    provider: 'loqate',
    address: [
      { key: 'lookup' },
      { key: 'street', required: true },
      { key: 'house', required: true },
      { key: 'apartment' },
      { key: 'postal', required: true },
      { key: 'city', autofilled: true, required: true },
    ],
    recipient: [
      { key: 'recipientName', required: true },
      { key: 'recipientPhone', required: true },
      { key: 'recipientEmail' },
    ],
  },

  pl: {
    code: 'pl',
    locale: 'pl',
    provider: 'loqate',
    address: [
      { key: 'lookup' },
      { key: 'street', required: true },
      { key: 'house', required: true },
      { key: 'apartment' },
      { key: 'postal', required: true },
      { key: 'city', autofilled: true, required: true },
    ],
    recipient: [
      { key: 'recipientName', required: true },
      { key: 'recipientPhone', required: true },
      { key: 'recipientEmail' },
    ],
  },

  cz: {
    code: 'cz',
    locale: 'cs',
    provider: 'loqate',
    address: [
      { key: 'lookup' },
      { key: 'street', required: true },
      { key: 'house', required: true },
      { key: 'apartment' },
      { key: 'postal', required: true },
      { key: 'city', autofilled: true, required: true },
    ],
    recipient: [
      { key: 'recipientName', required: true },
      { key: 'recipientPhone', required: true },
      { key: 'recipientEmail' },
    ],
  },

  us: {
    code: 'us',
    locale: 'en',
    provider: 'loqate',
    // В США номер дома входит в street line — отдельного поля «дом» нет.
    // Штат выводится из ZIP и вручную не выбирается.
    address: [
      { key: 'lookup' },
      { key: 'street', required: true },
      { key: 'apartment' },
      { key: 'postal', required: true },
      { key: 'city', autofilled: true, required: true },
      { key: 'region', type: 'select', autofilled: true, required: true },
    ],
    recipient: [
      { key: 'recipientName', required: true },
      { key: 'recipientPhone', required: true },
      { key: 'recipientEmail' },
    ],
    regions: [
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
      { value: 'TX', label: 'Texas' },
      { value: 'FL', label: 'Florida' },
      { value: 'IL', label: 'Illinois' },
      // Полный список штатов и территорий — при подключении провайдера.
    ],
  },
}

export const countryCodes = Object.keys(countries) as CountryCode[]

export const defaultCountry: CountryCode = 'ru'
