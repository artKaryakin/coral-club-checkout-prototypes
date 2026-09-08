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
      class="cc3-stand-field__select"
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
      class="cc3-stand-field__textarea"
      :name="field.key"
      :placeholder="field.placeholder"
      rows="3"
    />

    <Cc3InputField
      v-else
      :id="fieldId"
      v-model="value"
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

import Cc3InputField from '@/components/Field/Cc3InputField.vue'

import type { StandField } from '../config/types'
import { useStand } from '../composables/useStand'

/**
 * Универсальное поле формы.
 *
 * Настоящие input/select/textarea и label с for обязательны: без них не
 * работает нативное автозаполнение браузера и на мобильном открывается
 * неправильная клавиатура. Дивы вместо полей — самая частая ошибка при
 * вёрстке по макету.
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
  gap: var(--st-global-distance-space-inset-sm);

  // Отступ задаётся самому полю, а не через соседей: порядок полей приходит
  // из конфига страны и непостоянен, селекторы вида :nth-child и + сломаются.
  margin-block-end: var(--st-global-distance-space-inset-xl);
  width: 100%;

  &__label {
    display: flex;
    align-items: center;
    gap: 2px;

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__required {
    @include font('label-xs');

    color: var(--st-content-foreground-color-negative-primary);
  }

  &__select,
  &__textarea {
    padding: 0 var(--st-global-distance-space-inset-md);
    width: 100%;

    font-family: inherit;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
    background-color: var(--st-content-background-color-neutral-primary);
    border: 2px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-sm);

    &:disabled {
      background-color: var(--st-content-background-color-neutral-subtle);
    }
  }

  &__select {
    height: 44px;
  }

  &__textarea {
    padding-top: var(--st-global-distance-space-inset-md);
    padding-bottom: var(--st-global-distance-space-inset-md);

    resize: vertical;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-global-distance-space-inset-md);
  }

  &__chip {
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-xl);

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-primary);
    background-color: var(--st-content-background-color-default-solid-normal);
    border: 1px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-pill);
    cursor: pointer;

    &--active {
      color: var(--st-action-foreground-color-positive-normal);
      border-color: var(--st-action-foreground-color-positive-normal);
    }
  }

  &__hint {
    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }
}
</style>
