<script setup lang="ts">
// Локальная замена C2Checkbox из пакета `ui`.
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="cc3-checkbox-field">
    <input v-model="model" type="checkbox" class="cc3-checkbox-field__input" />

    <span class="cc3-checkbox-field__label">
      <slot />
    </span>
  </label>
</template>

<style lang="scss">
.cc3-checkbox-field {
  display: flex;
  align-items: flex-start;
  gap: var(--st-global-distance-space-stack-sm);

  @include font('body-xs');

  cursor: pointer;

  &__input {
    flex-shrink: 0;

    margin: 0;
    width: 16px;
    height: 16px;

    accent-color: var(--st-content-foreground-color-primary-secondary);
    cursor: pointer;
  }
}
</style>
