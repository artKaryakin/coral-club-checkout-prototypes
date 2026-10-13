import { countries } from '../config/countries'
import type { CountryCode } from '../config/types'
import type { AddressSuggestion, SuggestProvider } from './types'

/**
 * Подсказки адресов через Geoapify — все рынки, кроме России.
 *
 * Пришёл на смену Photon, и причина измеримая. Публичный демо-сервер
 * Photon отвечал 5–8 секунд на каждый новый запрос — дольше нашего срока
 * ожидания в пять секунд. Респондент в США видел «ищем» до упора, потом
 * «ничего не найдено», и вводил адрес руками. Geoapify на тех же запросах
 * отвечает за 0,4–2 секунды.
 *
 * Вторая причина — почтовые индексы. По запросу «20171» Photon отдавал
 * «Forest Road 2017-165» в Орегоне: он ищет по названиям, а голое число
 * матчит как часть имени дороги. Geoapify понимает индекс и отдаёт районы
 * этого индекса в Вирджинии.
 *
 * Это не кандидат в прод — там выбран Loqate (см. конфиг стран). Здесь
 * нужен живой и быстрый сервис на время тестов.
 *
 * Документация: https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/
 */
const AUTOCOMPLETE_ENDPOINT = 'https://api.geoapify.com/v1/geocode/autocomplete'

const REVERSE_ENDPOINT = 'https://api.geoapify.com/v1/geocode/reverse'

/**
 * Ключ приходит из переменной окружения: в репозитории его нет, как и
 * любого другого токена. Нет ключа — провайдер не регистрируется, и рынки
 * остаются на Photon.
 */
export const geoapifyToken: string = import.meta.env.VITE_GEOAPIFY_TOKEN ?? ''

/** Сколько показываем. */
const LIMIT = 8

/** Радиус поиска дома вокруг метки на карте не настраивается — берём ближайший. */
const REVERSE_LIMIT = 1

/** Рынки, где адрес читают от города к дому. */
const cityFirst: CountryCode[] = ['ru', 'kz']

/**
 * Что ценнее в списке. Дом важнее улицы, улица важнее района: в чекауте
 * выбирают, куда привезти, а не куда поехать. Сервис отдаёт вперемешку —
 * раскладываем на своей стороне.
 */
const TYPE_ORDER = ['building', 'street', 'amenity']

interface GeoapifyResult {
  place_id?: string
  address_line1?: string
  housenumber?: string
  street?: string
  city?: string
  state?: string
  state_code?: string
  postcode?: string
  lat?: number
  lon?: number
  result_type?: string
}

function rank(item: GeoapifyResult): number {
  const index = TYPE_ORDER.indexOf(item.result_type ?? '')

  return index === -1 ? TYPE_ORDER.length : index
}

async function ask(url: URL, signal: AbortSignal): Promise<GeoapifyResult[]> {
  url.searchParams.set('format', 'json')
  url.searchParams.set('apiKey', geoapifyToken)

  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`geoapify: ${response.status}`)
  }

  const data = (await response.json()) as { results?: GeoapifyResult[] }

  return data.results ?? []
}

/**
 * Улица с домом в местном порядке.
 *
 * В США номер дома идёт перед улицей, в Европе и СНГ — после. Photon
 * ставил его перед улицей везде, и в Германии подсказка «42
 * Kastanienallee» спорила с сохранёнными карточками «Kastanienallee 42».
 *
 * Имя из address_line1 берём только тогда, когда улицы нет вовсе: так
 * выглядят результаты по индексу, где первой строкой приходит район. У
 * точек интереса сервис кладёт туда название — «WSKQ-FM (New York)»
 * вместо «350 5th Avenue», — поэтому своя сборка, а не готовая строка.
 */
const houseFirst: CountryCode[] = ['us']

function streetWithHouse(item: GeoapifyResult, country: CountryCode, withHouse: boolean): string {
  const street = item.street?.trim() ?? ''
  const house = withHouse ? (item.housenumber?.trim() ?? '') : ''

  if (!street) {
    return item.address_line1?.trim() ?? ''
  }

  if (houseFirst.includes(country)) {
    return [house, street].filter(Boolean).join(' ')
  }

  // В СНГ дом отделяется запятой: «улица Абая, 150». В Европе — пробелом:
  // «Kastanienallee 42».
  return [street, house].filter(Boolean).join(cityFirst.includes(country) ? ', ' : ' ')
}

/** Порядок частей — местный, как и везде на стенде. */
function compose(country: CountryCode, item: GeoapifyResult, withHouse: boolean): string {
  const city = item.city?.trim() ?? ''
  const postal = item.postcode?.trim() ?? ''
  const region = item.state_code?.trim() || item.state?.trim() || ''

  // В СНГ дом — отдельная часть через запятую: «Алматы, ул Абая, 150».
  if (cityFirst.includes(country)) {
    const house = withHouse ? (item.housenumber?.trim() ?? '') : ''

    return [city, streetWithHouse(item, country, false), house].filter(Boolean).join(', ')
  }

  const head = streetWithHouse(item, country, withHouse)

  if (country === 'us') {
    return [head, city, [region, postal].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  }

  return [head, [postal, city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
}

function toSuggestion(item: GeoapifyResult, country: CountryCode, index: number): AddressSuggestion {
  const house = item.housenumber?.trim() ?? ''
  const street = item.street?.trim() ?? ''

  return {
    id: item.place_id ?? `geoapify-${index}`,
    label: compose(country, item, true),
    street,
    house,
    postal: item.postcode?.trim() ?? '',
    city: item.city?.trim() ?? '',
    // Код штата, а не название: в форме США регион — список кодов, и по
    // «Virginia» он не подставится.
    region: item.state_code?.trim() || item.state?.trim() || '',
    lat: item.lat,
    lng: item.lon,
    streetLine: streetWithHouse(item, country, true),
    lineWithoutHouse: house && street ? compose(country, item, false) : undefined,
  }
}

export const geoapifyProvider: SuggestProvider = {
  code: 'geoapify',

  debounceMs: 300,

  async suggest(query, country, signal) {
    const { mapCenter, locale } = countries[country]
    const url = new URL(AUTOCOMPLETE_ENDPOINT)

    url.searchParams.set('text', query)
    url.searchParams.set('limit', String(LIMIT))
    // Своя страна и только она: чужие адреса в чекауте выбрать нельзя.
    url.searchParams.set('filter', `countrycode:${country}`)
    // Смещение к городу рынка: «Kastanienallee 42» есть в десятке городов,
    // и без подсказки, откуда человек, список открывается не теми.
    url.searchParams.set('bias', `proximity:${mapCenter.lng},${mapCenter.lat}`)
    url.searchParams.set('lang', locale)

    const items = await ask(url, signal)

    return items
      .slice()
      .sort((a, b) => rank(a) - rank(b))
      .map((item, index) => toSuggestion(item, country, index))
      .filter((suggestion) => suggestion.label.length > 0)
  },

  async reverse(point, country, signal) {
    const url = new URL(REVERSE_ENDPOINT)

    url.searchParams.set('lat', String(point.lat))
    url.searchParams.set('lon', String(point.lng))
    url.searchParams.set('limit', String(REVERSE_LIMIT))
    url.searchParams.set('lang', countries[country].locale)

    const [first] = await ask(url, signal)

    if (!first) {
      return undefined
    }

    // Координаты берём те, куда ткнули, а не центр найденного дома: метка
    // не должна прыгать из-под пальца.
    return { ...toSuggestion(first, country, 0), lat: point.lat, lng: point.lng }
  },
}
