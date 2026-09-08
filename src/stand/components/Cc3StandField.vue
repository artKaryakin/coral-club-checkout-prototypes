<template>
  <div class="cc3-stand-field" :class="modifiers">
    <label class="cc3-stand-field__label" :for="fieldId">
      {{ field.label }}
      <span v-if="field.required" class="cc3-stand-field__required">*</span>
    </label>

    <div v-if="field.type === 'chips'" class="cc3-stand-field__chips">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="cc3-stand-field__chip"
        :class="{ 'cc3-stand-field__chip--active': value === option.value }"
        @click="value = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <select
      v-else-if="field.type === 'select'"
      :id="fieldId"
      v-model="value"
      class="cc3-stand-field__control"
      :name="field.key"
      :autocomplete="field.autocomplete"
      :disabled="field.autofilled"
    >
      <option value="" disabled>{{ field.placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <textarea
      v-else-if="field.type === 'textarea'"
      :id="fieldId"
      v-model="value"
      class="cc3-stand-field__control cc3-stand-field__control--textarea"
      :name="field.key"
      :placeholder="field.placeholder"
      rows="3"
    />

    <input
      v-else
      :id="fieldId"
      v-model="value"
      class="cc3-stand-field__control"
      :name="field.key"
      :type="inputType"
      :placeholder="field.placeholder"
      :autocomplete="field.autocomplete"
      :readonly="field.autofilled"
      :inputmode="inputMode"
    />

    <span v-if="field.autofilled" class="cc3-stand-field__hint">{{ autofilledHint }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StandField } from '../config/types'
import { useStand } from '../composables/useStand'

/**
 * Универсальное поле формы.
 *
 * Настоящие input и label с for обязательны: без них не работает нативное
 * автозаполнение браузера и на мобильном открывается неправильная клавиатура.
 * Дивы вместо полей — самая частая ошибка при вёрстке по макету.
 *
 * Поле с autofilled заполняется по индексу или из подсказки и вручную не
 * вводится — визуально это должно быть отличимо от введённого руками.
 *
 * Плейсхолдер приходит из конфига страны и показывает местный формат адреса.
 * Это подсказка, а не замена подписи: label остаётся на месте всегда.
 */
const props = defineProps<{ field: StandField }>()

const value = defineModel<string>({ default: '' })

const { t } = useStand()

const fieldId = computed(() => `stand-field-${props.field.key}`)

const autofilledHint = computed(() => t('field.autofilled.hint'))

const options = computed(() => props.field.options ?? [])

const inputType = computed(() => {
  if (props.field.type === 'phone') return 'tel'
  if (props.field.type === 'email') return 'email'

  return 'text'
})

const inputMode = computed(() => {
  if (props.field.key === 'postal') return 'numeric'
  if (props.field.type === 'phone') return 'tel'

  return undefined
})

const modifiers = computed(() => ({
  'cc3-stand-field--autofilled': props.field.autofilled,
  'cc3-stand-field--required': props.field.required,
  'cc3-stand-field--half': props.field.half,
  [`cc3-stand-field--key--${props.field.key}`]: true,
}))
</script>

<style lang="scss">
.cc3-stand-field {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-inset-xs);

  // Отступ задаётся самому полю, а не через соседей: порядок полей приходит
  // из конфига страны и непостоянен, селекторы вида :nth-child и + сломаются.
  margin-block-end: var(--st-global-distance-space-inset-lg);
  width: 100%;

  &__label {
    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__required {
    color: var(--st-content-foreground-color-negative-primary);
  }

  &__control {
    padding: var(--st-global-distance-space-inset-md);
    width: 100%;

    color: var(--st-content-foreground-color-neutral-primary);
    background-color: var(--st-content-background-color-neutral-primary);
    border-color: var(--st-action-border-color-neutral-subtle-normal);
    border-style: solid;
    border-width: 1px;
    border-radius: var(--st-global-radius-md);

    &--textarea {
      resize: vertical;
    }
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-global-distance-space-inset-sm);
  }

  &__chip {
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-lg);

    color: var(--st-content-foreground-color-neutral-primary);
    background-color: var(--st-content-background-color-neutral-secondary);
    border: none;
    border-radius: var(--st-global-radius-lg);
    cursor: pointer;

    &--active {
      color: var(--st-content-foreground-color-primary-secondary);
      background-color: var(--st-content-background-color-primary-subtle);
    }
  }

  &__hint {
    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &--autofilled &__control {
    background-color: var(--st-content-background-color-neutral-secondary);
  }
}
</style>
