import { computed } from 'vue'
import { autocompleteByKey, defaultTypeByKey } from '../config/types'
import type { FieldGroup, StandField } from '../config/types'
import { useStand } from './useStand'

/**
 * Отдаёт варианту интерфейса готовый список полей.
 *
 * Вариант не перечисляет поля вручную — он проходит по этому списку циклом
 * и оформляет каждое поле. Поэтому:
 *  - состав и порядок полей меняются от страны к стране без правок вёрстки;
 *  - новое поле появляется сразу во всех вариантах;
 *  - стилизовать поля через :nth-child нельзя, порядок непостоянен.
 *
 * Подписи и примеры ввода приходят из словаря уже под текущий рынок:
 * в России в строке адреса подсказка «Москва, ул. Москворечье, 43»,
 * в США — «350 5th Ave». Респондент должен узнавать свой формат адреса,
 * иначе проверяется не форма, а способность разобрать чужой.
 */
export function useStandFields(group: FieldGroup) {
  const { countryConfig, t } = useStand()

  const fields = computed<StandField[]>(() =>
    countryConfig.value[group].map((field) => {
      const type = field.type ?? defaultTypeByKey[field.key]

      return {
        key: field.key,
        type,
        label: t(`field.${field.key}.label`),
        placeholder: t(`field.${field.key}.placeholder`),
        autocomplete: autocompleteByKey[field.key],
        required: field.required ?? false,
        autofilled: field.autofilled ?? false,
        prefilled: field.prefilled ?? false,
        half: field.half ?? false,
        options:
          field.key === 'region'
            ? countryConfig.value.regions
            : type === 'chips'
              ? [
                  { value: 'home', label: t('field.addressLabel.home') },
                  { value: 'work', label: t('field.addressLabel.work') },
                  { value: 'custom', label: t('field.addressLabel.custom') },
                ]
              : undefined,
      }
    }),
  )

  return { fields }
}
