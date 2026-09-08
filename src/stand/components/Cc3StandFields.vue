<template>
  <div class="cc3-stand-fields">
    <Cc3StandField
      v-for="field in fields"
      :key="field.key"
      :field="field"
      :model-value="values[field.key] ?? ''"
      @update:model-value="onUpdate(field.key, $event)"
      @select="onSelect(field.key, $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { FieldGroup, FieldKey } from '../config/types'
import { applySuggestion } from '../suggest/applySuggestion'
import type { AddressSuggestion } from '../suggest/types'
import { useStandFields } from '../composables/useStandFields'
import Cc3StandField from './Cc3StandField.vue'

/**
 * Группа полей формы — адрес или получатель.
 *
 * Вариант интерфейса вставляет её одной строкой и не перечисляет поля:
 * состав, порядок, подписи и примеры ввода приходят из конфига страны.
 * Сетка здесь — рабочая заглушка на время, пока дизайн не оформит блок:
 * поля в одну колонку, помеченные в конфиге как half — по два в ряд.
 * Когда появится своя вёрстка, вариант может пройтись по useStandFields
 * циклом сам, а этот компонент не использовать.
 */
const props = defineProps<{ group: FieldGroup }>()

/** Значения полей — общая форма варианта, ключи совпадают с ключами полей. */
const values = defineModel<Partial<Record<FieldKey, string>>>({ required: true })

const { fields } = useStandFields(props.group)

function onUpdate(key: FieldKey, value: string) {
  values.value = { ...values.value, [key]: value }
}

/**
 * Подстановка из выбранной подсказки. Раскладку по полям делает общая
 * функция: то же самое происходит в строке поиска на карте, и вести себя
 * это должно одинаково.
 */
function onSelect(sourceKey: FieldKey, suggestion: AddressSuggestion) {
  values.value = applySuggestion(values.value, sourceKey, suggestion, fields.value)
}
</script>

<style lang="scss">
.cc3-stand-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--st-global-distance-space-inset-md);

  width: 100%;

  .cc3-stand-field--half {
    flex: 1 1 calc(50% - var(--st-global-distance-space-inset-md));
    width: auto;
    min-width: 140px;
  }
}
</style>
