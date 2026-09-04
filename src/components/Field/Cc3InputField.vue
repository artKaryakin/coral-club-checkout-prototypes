<script setup lang="ts">
// Локальная замена C2Input из пакета `ui`.
type Props = {
  type?: string
  placeholder?: string
  invalid?: boolean
  inputmode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'url' | 'search' | 'none'
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: undefined,
  invalid: false,
  inputmode: undefined,
})

const model = defineModel<string>({ default: '' })
</script>

<template>
  <span class="cc3-input-field" :class="{ 'cc3-input-field--invalid': invalid }">
    <slot name="prefix" />

    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :inputmode="inputmode"
      class="cc3-input-field__input"
    />
  </span>
</template>

<style lang="scss">
.cc3-input-field {
  display: flex;
  align-items: center;
  gap: var(--st-global-distance-space-stack-sm);

  padding: 0 var(--st-global-distance-space-inset-md);
  width: 100%;
  height: 44px;

  background-color: var(--st-content-background-color-neutral-primary);
  border: 2px solid var(--st-content-border-color-neutral-implicit);
  border-radius: var(--st-global-radius-sm);

  &:hover {
    background-color: var(--st-content-background-color-neutral-subtle);
    border-color: var(--st-content-border-color-neutral-disable);
  }

  // #A0ADB7 — цвет из референса, точного токена ДС под него нет.
  &:focus-within {
    background-color: var(--st-content-background-color-neutral-subtle);
    border-color: #a0adb7;
  }

  &--invalid {
    border-color: var(--st-content-border-color-negative-explicit);
  }

  &__input {
    padding: 0;
    width: 100%;

    font-family: inherit;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
    background: none;
    border: none;

    &::placeholder {
      color: var(--st-content-foreground-color-neutral-tetriary);
    }

    &:focus {
      outline: none;
    }
  }
}
</style>
