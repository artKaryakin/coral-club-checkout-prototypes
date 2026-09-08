import type { FieldKey, StandField } from '../config/types'
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
 */
export function applySuggestion(
  current: FieldValues,
  sourceKey: FieldKey,
  suggestion: AddressSuggestion,
  fields: StandField[],
): FieldValues {
  const filled: FieldValues = { [sourceKey]: suggestion.label }
  const byKey = new Map(fields.map((field) => [field.key, field]))
  const plain: [FieldKey, string][] = [
    ['house', suggestion.house],
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
