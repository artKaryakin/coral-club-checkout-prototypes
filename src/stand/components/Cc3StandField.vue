<template>
  <div
    class="cc3-stand-field"
    :class="modifiers"
    @focusin="onFocus"
    @focusout="onBlur"
    @input="onInput"
    @keydown="onKeydown"
  >
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
      :placeholder="placeholder"
      rows="3"
    />

    <Cc3InputField
      v-else
      :id="fieldId"
      v-model="value"
      :name="field.key"
      :type="inputType"
      :placeholder="placeholder"
      :autocomplete="field.autocomplete"
      :readonly="field.autofilled"
      :inputmode="inputMode"
    />

    <Cc3StandFieldSuggest
      v-if="isListOpen"
      :items="items"
      :active-index="activeIndex"
      :status="status"
      @pick="onPick"
      @hover="onHover"
    />

    <span v-if="hint" class="cc3-stand-field__hint">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import Cc3InputField from '@/components/Field/Cc3InputField.vue'

import type { StandField } from '../config/types'
import type { AddressSuggestion } from '../suggest/types'
import { useAddressSuggest } from '../composables/useAddressSuggest'
import { useStand } from '../composables/useStand'
import Cc3StandFieldSuggest from './Cc3StandFieldSuggest.vue'

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
 * Поле с prefilled тоже заполняется из подсказки, но остаётся обычным:
 * подсказка может не отдать значение, и тогда его вводят руками.
 *
 * Поле типа autocomplete показывает подсказки адреса. Список и запрос
 * разнесены: запрос и выбранная строка здесь, отображение — в
 * Cc3StandFieldSuggest. Слушатели висят на обёртке, а не на самом поле:
 * Cc3InputField кладёт чужие атрибуты и обработчики на свой корневой span,
 * а focus и blur со span не всплывают — фокус терялся бы.
 *
 * Плейсхолдер приходит из конфига страны и показывает местный формат адреса.
 * Это подсказка, а не замена подписи: label остаётся на месте всегда.
 */
const props = defineProps<{ field: StandField }>()

const emit = defineEmits<{ select: [suggestion: AddressSuggestion] }>()

const value = defineModel<string>({ default: '' })

const { t } = useStand()
const { items, status, ask, reset } = useAddressSuggest()

const isFocused = ref(false)
const activeIndex = ref(-1)

const fieldId = computed(() => `stand-field-${props.field.key}`)

const isSuggest = computed(() => props.field.type === 'autocomplete')

const isListOpen = computed(
  () => isSuggest.value && isFocused.value && (items.value.length > 0 || status.value !== 'idle'),
)

// Подпись есть только у полей, которые нельзя ввести руками: она объясняет,
// почему поле заблокировано. У prefilled поля объяснять нечего — оно ведёт
// себя как обычное, и подпись под ним только шумит.
const hint = computed(() => (props.field.autofilled ? t('field.autofilled.hint') : ''))

const options = computed(() => props.field.options ?? [])

// Плейсхолдер-пример (формат адреса, ФИО, email) сбивает — похож на уже
// введённое значение. Оставляем его только у телефона: это маска ввода,
// а не образец, и без неё непонятно, в каком формате набирать номер.
const placeholder = computed(() => (props.field.type === 'phone' ? props.field.placeholder : ''))

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

function onInput(event: Event) {
  if (!isSuggest.value) {
    return
  }

  activeIndex.value = -1
  ask((event.target as HTMLInputElement).value)
}

function onFocus() {
  isFocused.value = true
}

function onBlur() {
  isFocused.value = false
  activeIndex.value = -1
}

function onHover(index: number) {
  activeIndex.value = index
}

/**
 * Выбор подсказки не пишет в своё поле напрямую.
 *
 * Строка адреса и разобранные из неё дом, индекс и город должны лечь в форму
 * одним изменением: значения полей живут выше по дереву, и две записи подряд
 * в одном такте затирают друг друга — вторая читает ещё не обновлённые
 * значения. Поэтому поле только сообщает о выборе, а пишет их владелец.
 */
function onPick(suggestion: AddressSuggestion) {
  isFocused.value = false
  activeIndex.value = -1
  reset()
  emit('select', suggestion)
}

function move(step: number) {
  const total = items.value.length

  if (total === 0) {
    return
  }

  activeIndex.value = (activeIndex.value + step + total) % total
}

/**
 * Клавиатура обрабатывается одним обработчиком, а не модификаторами:
 * перехватывать Enter можно только при открытом списке, иначе поле
 * перестанет вести себя как обычное поле формы.
 */
function onKeydown(event: KeyboardEvent) {
  if (!isListOpen.value) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    move(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    move(-1)
  } else if (event.key === 'Enter') {
    const active = items.value[activeIndex.value]

    if (active) {
      event.preventDefault()
      onPick(active)
    }
  } else if (event.key === 'Escape') {
    isFocused.value = false
    activeIndex.value = -1
  }
}

const modifiers = computed(() => ({
  'cc3-stand-field--autofilled': props.field.autofilled,
  'cc3-stand-field--prefilled': props.field.prefilled,
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

  // Точка отсчёта для выпадающего списка подсказок.
  position: relative;

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
