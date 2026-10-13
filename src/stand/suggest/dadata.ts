import type { CountryCode } from '../config/types'
import type { AddressSuggestion, SuggestProvider } from './types'

/**
 * Подсказки адресов через «Дадату» — российский рынок.
 *
 * Photon остаётся на остальных рынках, но по России он заметно слабее: это
 * OSM, дом находится не всегда, индекс заполнен не везде, а город
 * приходит латиницей. «Дадата» работает по ГАР, отдаёт индекс, координаты
 * и разобранный адрес, и респондент видит ту же строку, что на Озоне и в
 * Яндексе, — «г Москва, ул Москворечье, д 43».
 *
 * Ключ публичный по устройству сервиса: подсказки задуманы как запрос из
 * браузера, и в собранном стенде ключ всё равно виден. Защита у него одна —
 * привязка к домену в личном кабинете «Дадаты». Секретный ключ сюда не
 * попадает никогда: он нужен только серверной «Стандартизации».
 *
 * Документация: https://dadata.ru/api/suggest/address
 */
const SUGGEST_ENDPOINT = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address'

/** Адрес по точке на карте. Тот же ключ, тот же дневной лимит. */
const GEOLOCATE_ENDPOINT = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address'

/**
 * Ключ приходит из переменной окружения: в репозитории его нет, как и
 * любого другого токена (см. .gitignore и .env.example). Нет ключа —
 * провайдер не регистрируется, и Россия остаётся на Photon.
 */
export const dadataToken: string = import.meta.env.VITE_DADATA_TOKEN ?? ''

/** Сколько показываем. Меньше запрошенного сервис не отдаёт, больше незачем. */
// Восемь: поиск адреса переехал в отдельное окно, и место под списком
// есть. Пять строк отсекали нужный дом там, где на улице много корпусов.
const LIMIT = 8

/**
 * Москва — город российского рынка стенда. Буст, а не ограничение: человек
 * из Казани должен найти свой дом, но на «Ленина 5» без буста приходят
 * переулки Воронежской и Смоленской областей, а на «Тверская 1» — Петербург
 * с Нижним Новгородом вперемешку с Москвой.
 */
const MOSCOW_KLADR = '7700000000000'

/** Радиус поиска дома вокруг метки на карте. Сервисный максимум — 1000 м. */
const REVERSE_RADIUS_M = 300

interface DadataAddress {
  postal_code?: string | null
  region_with_type?: string | null
  city?: string | null
  settlement?: string | null
  street_with_type?: string | null
  house?: string | null
  flat?: string | null
  geo_lat?: string | null
  geo_lon?: string | null
  fias_id?: string | null
}

interface DadataSuggestion {
  value?: string
  data?: DadataAddress
}

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Token ${dadataToken}`,
  }
}

async function ask(url: string, body: unknown, signal: AbortSignal): Promise<DadataSuggestion[]> {
  const response = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    throw new Error(`dadata: ${response.status}`)
  }

  const data = (await response.json()) as { suggestions?: DadataSuggestion[] }

  return data.suggestions ?? []
}

/**
 * Населённый пункт: у городов это city, у сёл и посёлков — settlement.
 * Берём то, что заполнено, иначе поле города осталось бы пустым там, где
 * адрес есть.
 */
function localityOf(data: DadataAddress): string {
  return data.city?.trim() || data.settlement?.trim() || ''
}

/**
 * Строка без номера дома — для случая, когда дом уходит в своё поле.
 *
 * Отрезаем от готовой строки последнюю часть, а не собираем новую из
 * кусков. Собранная отличалась бы написанием — «Москва, ул Москворечье»
 * вместо «г Москва, ул Москворечье», — и человек прочитал бы это как
 * «адрес подменили». И главное: не у каждого адреса есть улица. У садовых
 * товариществ и посёлков её нет вовсе, а «тер. СНТ Москворечье» живёт
 * только в готовой строке — собранная потеряла бы его целиком.
 *
 * Отрезаем только если последняя часть действительно про номер: в ней
 * обязан встретиться он сам. «г Москва, ул Тверская, д 1 стр 2» →
 * «г Москва, ул Тверская», а строка без дома остаётся как есть.
 *
 * Частей может быть две: человек вводит адрес одной строкой вместе с
 * квартирой — «Москворечье 43 45», — и «Дадата» отвечает «…, д 43, кв 45».
 * Сначала уходит квартира, следом дом; каждая в своё поле формы.
 */
function trimTail(value: string, number: string): string {
  if (!number) {
    return value
  }

  const parts = value.split(', ')
  const last = parts[parts.length - 1] ?? ''

  return parts.length > 1 && last.includes(number) ? parts.slice(0, -1).join(', ') : value
}

function lineWithoutNumbers(value: string, house: string, flat: string): string {
  return trimTail(trimTail(value, flat), house)
}

function toSuggestion(item: DadataSuggestion, index: number): AddressSuggestion {
  const data = item.data ?? {}
  const house = data.house?.trim() ?? ''
  const flat = data.flat?.trim() ?? ''
  const label = item.value?.trim() ?? ''

  return {
    id: data.fias_id ?? `dadata-${index}`,
    label,
    // Улица с типом: «ул Москворечье», а не «Москворечье». Без типа строка
    // в поле выглядит оборванной.
    street: data.street_with_type?.trim() ?? '',
    house,
    postal: data.postal_code?.trim() ?? '',
    city: localityOf(data),
    region: data.region_with_type?.trim() ?? '',
    lat: data.geo_lat ? Number(data.geo_lat) : undefined,
    lng: data.geo_lon ? Number(data.geo_lon) : undefined,
    // Квартиру «Дадата» отдаёт отдельным полем, если человек ввёл её в
    // строку. Она уходит в поле «Квартира», а не остаётся в адресе.
    apartment: flat,
    lineWithoutHouse: house || flat ? lineWithoutNumbers(label, house, flat) : undefined,
  }
}

export const dadataProvider: SuggestProvider = {
  code: 'dadata',

  /**
   * «Дадата» задумана как поиск по мере ввода, и частота запросов у неё
   * щедрая — 30 в секунду с адреса. Ограничение другое: 10 000 запросов в
   * сутки на бесплатном тарифе, суммарно по всем видам подсказок. Поэтому
   * экономим не частотой, а объёмом: пауза после ввода короче, чем у
   * Photon, но запрашиваем ровно пять результатов.
   */
  debounceMs: 300,

  async suggest(query, _country, signal) {
    const items = await ask(
      SUGGEST_ENDPOINT,
      {
        query,
        count: LIMIT,
        // Россия целиком, а не один город: респондент должен найти свой
        // настоящий дом, где бы он ни жил.
        locations: [{ country: 'Россия' }],
        locations_boost: [{ kladr_id: MOSCOW_KLADR }],
        // Нижняя граница — улица. Без неё первые буквы отдают регионы и
        // города («г Москва», «Московская обл»), которые в чекауте выбрать
        // нельзя: по ним не доставляют.
        //
        // Верхней границы нет сознательно. Стояла «не глубже дома», и
        // запрос с квартирой — «Москворечье 43 45», как вводят на Озоне и
        // в Яндексе, — не находил ничего. Хуже того, «Тверская 1 кв 5»
        // находил турбазу в Тверской области: не пусто, а чужой адрес.
        from_bound: { value: 'street' },
      },
      signal,
    )

    return items.map(toSuggestion).filter((suggestion) => suggestion.label.length > 0)
  },

  async reverse(point, _country, signal) {
    const items = await ask(
      GEOLOCATE_ENDPOINT,
      { lat: point.lat, lon: point.lng, count: 1, radius_meters: REVERSE_RADIUS_M },
      signal,
    )

    const first = items[0]

    if (!first) {
      return undefined
    }

    // Координаты берём те, куда ткнули, а не центр найденного дома: метка
    // не должна прыгать из-под пальца.
    return { ...toSuggestion(first, 0), lat: point.lat, lng: point.lng }
  },
}

/** Рынки, которые обслуживает «Дадата». Казахстан она не знает. */
export function isDadataMarket(country: CountryCode): boolean {
  return country === 'ru'
}
