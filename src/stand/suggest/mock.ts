import type { CountryCode } from '../config/types'
import type { AddressSuggestion } from './types'

/** Рынки, где адрес читают от города к дому. */
const cityFirst: CountryCode[] = ['ru', 'kz']

function entry(
  id: string,
  city: string,
  street: string,
  house: string,
  postal: string,
  lat: number,
  lng: number,
): AddressSuggestion {
  const country = id.split('-')[0] as CountryCode
  const label = cityFirst.includes(country)
    ? [city, street, house].join(', ')
    : `${house} ${street}, ${city}`

  return { id, label, street, house, postal, city, region: '', lat, lng }
}

/**
 * Запасные подсказки на случай, когда Photon недоступен.
 *
 * Публичный инстанс Photon работает без гарантий: он может ответить
 * ошибкой или не ответить вовсе. На интервью это выглядит как сломанный
 * прототип, поэтому список подменяется заглушкой — механика проверяется
 * дальше, а респондент не упирается в пустое поле.
 *
 * Адреса и координаты примерные, но в местном формате: важно, чтобы
 * респондент узнавал форму записи своего рынка, а карта не улетала
 * в другую страну.
 */
const mockByCountry: Record<CountryCode, AddressSuggestion[]> = {
  ru: [
    entry('ru-1', 'Москва', 'ул. Москворечье', '43', '115409', 55.6528, 37.6572),
    entry('ru-2', 'Москва', 'Ленинградский проспект', '80к17', '125315', 55.8074, 37.5121),
    entry('ru-3', 'Санкт-Петербург', 'Невский проспект', '28', '191186', 59.9351, 30.3275),
  ],
  kz: [
    entry('kz-1', 'Алматы', 'ул. Абая', '150', '050009', 43.2384, 76.8891),
    entry('kz-2', 'Астана', 'ул. Достык', '5', '010016', 51.1282, 71.4304),
  ],
  de: [
    entry('de-1', 'Berlin', 'Kastanienallee', '42', '10435', 52.5351, 13.4074),
    entry('de-2', 'München', 'Leopoldstraße', '17', '80802', 48.1563, 11.5834),
  ],
  pl: [
    entry('pl-1', 'Warszawa', 'ul. Marszałkowska', '84/92', '00-514', 52.2264, 21.0122),
    entry('pl-2', 'Kraków', 'ul. Floriańska', '20', '31-021', 50.0633, 19.9397),
  ],
  cz: [
    entry('cz-1', 'Praha', 'Vinohradská', '112', '130 00', 50.0778, 14.4512),
    entry('cz-2', 'Brno', 'Masarykova', '8', '602 00', 49.1946, 16.6104),
  ],
  us: [
    entry('us-1', 'New York', '5th Ave', '350', '10118', 40.7484, -73.9857),
    entry('us-2', 'Chicago', 'N Michigan Ave', '875', '60611', 41.8995, -87.6237),
  ],
}

export function mockSuggest(query: string, country: CountryCode): AddressSuggestion[] {
  const needle = query.trim().toLowerCase()
  const items = mockByCountry[country]
  const matched = items.filter((item) => item.label.toLowerCase().includes(needle))

  // Пустой список смотрелся бы как «ничего не найдено», хотя на самом деле
  // это отказ сервиса: показываем весь запасной набор.
  return matched.length > 0 ? matched : items
}
