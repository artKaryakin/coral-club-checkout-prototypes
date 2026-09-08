import { computed } from 'vue'
import { autocompleteByKey, defaultTypeByKey } from '../config/types'
import type { FieldGroup, StandField } from '../config/types'
import { useStand } from './useStand'

/**
 * Отдаёт варианту интерфейса готовый список полей.
 *
 * Вариант не перечисляет поля вручную — он проходит по этому списку циклом
 * и оформляет каждое поле. Поэтому:
 *  - порядок полей меняется от страны к стране без правок вёрстки;
 *  - новое поле появляется сразу во всех вариантах;
 *  - стилизовать поля через :nth-child нельзя, порядок непостоянен.
 */
export function useStandFields(group: FieldGroup) {
  const { countryConfig, t } = useStand()

  const fields = computed<StandField[]>(() =>
    countryConfig.value[group].map((field) => ({
      key: field.key,
      type: field.type ?? defaultTypeByKey[field.key],
      label: t(`field.${field.key}.label`),
      autocomplete: autocompleteByKey[field.key],
      required: field.required ?? false,
      autofilled: field.autofilled ?? false,
      options: field.key === 'region' ? countryConfig.value.regions : undefined,
    })),
  )

  return { fields }
}
