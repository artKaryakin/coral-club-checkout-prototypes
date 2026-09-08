import { countries } from '../config/countries'
import type { CountryCode } from '../config/types'
import type { AddressSuggestion, SuggestProvider } from './types'

/**
 * Подсказки адресов через Photon — открытый поиск по данным OSM.
 *
 * Взят как бесплатный слой: без ключа, без регистрации, с открытым CORS,
 * поэтому его видно прямо со статики стенда. Это НЕ кандидат в прод:
 * по России OSM заметно слабее DaData, до дома находит не всегда, индекс
 * заполнен не везде. Здесь он нужен, чтобы проверить саму механику —
 * ввод, список, выбор, подстановку — на живых, а не выдуманных ответах.
 *
 * Документация: https://photon.komoot.io
 */
const ENDPOINT = 'https://photon.komoot.io/api'

/** Обратное геокодирование — адрес по координатам. */
const REVERSE_ENDPOINT = 'https://photon.komoot.io/reverse'

/** Сколько показываем пользователю. */
const LIMIT = 5

/**
 * Сколько запрашиваем. Больше показанного: фильтр по стране отсекает часть
 * выдачи уже на клиенте, иначе список окажется полупустым.
 */
const RAW_LIMIT = 20

/**
 * Photon переводит названия на ограниченный набор языков. Для остальных
 * рынков язык не указываем — тогда приходит местное написание, что нам и
 * нужно: респондент должен видеть адрес так, как привык.
 */
const langByCountry: Partial<Record<CountryCode, string>> = {
  de: 'de',
  us: 'en',
}

/** Рынки, где адрес читают от города к дому. */
const cityFirst: CountryCode[] = ['ru', 'kz']

interface PhotonProperties {
  osm_id?: number
  osm_type?: string
  name?: string
  street?: string
  housenumber?: string
  postcode?: string
  city?: string
  town?: string
  village?: string
  district?: string
  state?: string
  countrycode?: string
}

interface PhotonFeature {
  properties?: PhotonProperties
  geometry?: { coordinates?: number[] }
}

function buildUrl(query: string, country: CountryCode): string {
  const { mapCenter } = countries[country]
  const url = new URL(ENDPOINT)

  url.searchParams.set('q', query)
  url.searchParams.set('limit', String(RAW_LIMIT))

  // Смещение выдачи к столице рынка: по одному «Ленина» без привязки
  // Photon отдаёт результаты со всего мира.
  url.searchParams.set('lat', String(mapCenter.lat))
  url.searchParams.set('lon', String(mapCenter.lng))

  const lang = langByCountry[country]

  if (lang) {
    url.searchParams.set('lang', lang)
  }

  return url.toString()
}

function formatLabel(street: string, house: string, city: string, country: CountryCode): string {
  if (cityFirst.includes(country)) {
    return [city, street, house].filter(Boolean).join(', ')
  }

  return [[house, street].filter(Boolean).join(' '), city].filter(Boolean).join(', ')
}

function toSuggestion(
  feature: PhotonFeature,
  country: CountryCode,
  index: number,
): AddressSuggestion {
  const properties = feature.properties ?? {}
  const street = properties.street ?? properties.name ?? ''
  const house = properties.housenumber ?? ''
  const city = properties.city ?? properties.town ?? properties.village ?? properties.district ?? ''
  const [lng, lat] = feature.geometry?.coordinates ?? []

  return {
    id: `${properties.osm_type ?? 'x'}${properties.osm_id ?? index}`,
    label: formatLabel(street, house, city, country),
    street,
    house,
    postal: properties.postcode ?? '',
    city,
    region: properties.state ?? '',
    lat,
    lng,
  }
}

/**
 * Photon не фильтрует выдачу по стране параметром запроса, поэтому чужие
 * страны отсекаются здесь по countrycode из ответа.
 */
function belongsToCountry(feature: PhotonFeature, country: CountryCode): boolean {
  return feature.properties?.countrycode?.toLowerCase() === country
}

export const photonProvider: SuggestProvider = {
  code: 'photon',

  async suggest(query, country, signal) {
    const response = await fetch(buildUrl(query, country), { signal })

    if (!response.ok) {
      throw new Error(`photon: ${response.status}`)
    }

    const data = (await response.json()) as { features?: PhotonFeature[] }
    const features = data.features ?? []

    return features
      .filter((feature) => belongsToCountry(feature, country))
      .map((feature, index) => toSuggestion(feature, country, index))
      .filter((suggestion) => suggestion.label.length > 0)
      .slice(0, LIMIT)
  },

  async reverse(point, country, signal) {
    const url = new URL(REVERSE_ENDPOINT)

    url.searchParams.set('lat', String(point.lat))
    url.searchParams.set('lon', String(point.lng))
    url.searchParams.set('limit', '1')

    const lang = langByCountry[country]

    if (lang) {
      url.searchParams.set('lang', lang)
    }

    const response = await fetch(url.toString(), { signal })

    if (!response.ok) {
      throw new Error(`photon reverse: ${response.status}`)
    }

    const data = (await response.json()) as { features?: PhotonFeature[] }
    const feature = data.features?.[0]

    if (!feature) {
      return undefined
    }

    const suggestion = toSuggestion(feature, country, 0)

    // Координаты берём те, куда ткнули, а не центр найденного объекта:
    // метка не должна прыгать из-под пальца.
    return { ...suggestion, lat: point.lat, lng: point.lng }
  },
}
