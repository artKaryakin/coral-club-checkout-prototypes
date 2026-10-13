import type { CountryCode, FieldKey, StandField } from '../config/types'
import type { AddressSuggestion } from './types'

export type FieldValues = Partial<Record<FieldKey, string>>

/**
 * Для select значение должно совпасть с одним из вариантов: провайдер отдаёт
 * название региона, а в списке штатов лежат коды. Не нашли — не трогаем поле,
 * это лучше, чем подставить значение, которого нет в списке.
 */
function matchOption(field: StandField, value: string): string | undefined {
  const needle = value.toLowerCase()

  return field.options?.find(
    (option) => option.value.toLowerCase() === needle || option.label.toLowerCase() === needle,
  )?.value
}

/**
 * Раскладывает выбранную подсказку по полям формы — одним изменением.
 *
 * Две вещи, из-за которых это отдельная функция, а не код внутри компонента:
 *  - подставлять нужно и из строки поиска на карте, и из формы адреса,
 *    а поведение должно быть одинаковым;
 *  - значения полей живут выше по дереву, и две записи подряд в одном такте
 *    затирают друг друга: вторая читает ещё не обновлённые значения.
 *
 * Заполняются только те поля, которые есть у текущей страны, и только
 * непустыми значениями: подсказка может не знать индекса, и затирать им
 * то, что человек уже ввёл руками, нельзя.
 *
 * Дом и квартира. Они уходят из строки адреса только тогда, когда поле
 * «Дом» видно на том же экране: иначе одно и то же число стоит дважды, и
 * человек, поправивший одно из них, оставляет поля спорящими между собой.
 *
 * Если поля дома на экране нет — шаг карты и поиска в модальном концепте,
 * рынки без отдельного поля, — дом остаётся внутри строки. Там она
 * единственное место, где адрес виден целиком, и без номера читается как
 * недовведённая.
 */

/** Рынки, где адрес читают от города к дому. */
const cityFirst: CountryCode[] = ['ru', 'kz']

/**
 * Строка адреса без номера дома.
 *
 * Провайдер мог собрать её сам — тогда берём его: у него свои типы частей
 * («г Москва, ул Москворечье»), и пересобранная нами строка отличалась бы
 * от той, которую человек только что выбрал из списка.
 */
function labelWithoutHouse(suggestion: AddressSuggestion, country: CountryCode): string {
  if (suggestion.lineWithoutHouse) {
    return suggestion.lineWithoutHouse
  }

  const parts = cityFirst.includes(country)
    ? [suggestion.city, suggestion.street]
    : [suggestion.street, suggestion.city]

  const label = parts.filter(Boolean).join(', ')

  // Провайдер мог не разобрать адрес на части — тогда лучше полная строка
  // с домом, чем пустое поле.
  return label || suggestion.label
}
export function applySuggestion(
  current: FieldValues,
  sourceKey: FieldKey,
  suggestion: AddressSuggestion,
  fields: StandField[],
  country: CountryCode,
  /**
   * Видно ли поле «Дом» на том же экране. По умолчанию — да, если оно есть
   * в наборе полей страны: формы, где поля идут одним списком, так и
   * устроены. Экран с одной строкой поиска передаёт false.
   */
  isHouseFieldVisible?: boolean,
): FieldValues {
  const byKey = new Map(fields.map((field) => [field.key, field]))
  const splitHouse = (isHouseFieldVisible ?? byKey.has('house')) && byKey.has('house')

  /**
   * Город, индекс и регион раскладываются по своим полям — значит внутри
   * строки адреса им делать нечего.
   *
   * До этого в строку уходила полная подсказка, и карточка схлопывалась в
   * одну строку: «350 5th Avenue, New York, NY 10001, Apt 66» вместо
   * «350 5th Avenue, Apt 66 / New York, NY 10001». Город и индекс стояли и
   * в строке, и в своих полях, а сборщик карточки честно выбрасывал
   * повторы — и вторую строку собирать было не из чего.
   *
   * На шаге карты своих полей нет, и туда по-прежнему идёт полная строка:
   * там она единственное место, где адрес виден целиком.
   */
  const street =
    byKey.has('city') && suggestion.streetLine
      ? suggestion.streetLine
      : splitHouse && (suggestion.house || suggestion.apartment)
        ? labelWithoutHouse(suggestion, country)
        : suggestion.label

  const filled: FieldValues = {
    [sourceKey]: street,
  }
  const plain: [FieldKey, string][] = [
    ['house', suggestion.house],
    // Квартира приходит из подсказки, только если человек сам вписал её в
    // строку адреса. Пустую не подставляем — иначе затёрли бы введённую
    // руками.
    ['apartment', suggestion.apartment ?? ''],
    ['postal', suggestion.postal],
    ['city', suggestion.city],
  ]

  plain.forEach(([key, value]) => {
    if (value && byKey.has(key)) {
      filled[key] = value
    }
  })

  const regionField = byKey.get('region')

  if (regionField && suggestion.region) {
    const value = regionField.options
      ? matchOption(regionField, suggestion.region)
      : suggestion.region

    if (value) {
      filled.region = value
    }
  }

  return { ...current, ...filled }
}
