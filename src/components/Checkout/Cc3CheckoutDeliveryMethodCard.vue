<script setup lang="ts">
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'

type Props = {
  icon: 'delivery-truck' | 'delivery-package-01'
  title: string
  hint: string
  selected: boolean
}

defineProps<Props>()
defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    class="cc3-checkout-delivery-method-card"
    :class="{ 'cc3-checkout-delivery-method-card--selected': selected }"
    @click="$emit('select')"
  >
    <Cc3Icon :name="icon" :size="32" class="cc3-checkout-delivery-method-card__icon" />

    <span class="cc3-checkout-delivery-method-card__text">
      <span class="cc3-checkout-delivery-method-card__title">{{ title }}</span>
      <span class="cc3-checkout-delivery-method-card__hint">{{ hint }}</span>
    </span>
  </button>
</template>

<style lang="scss">
.cc3-checkout-delivery-method-card {
  display: flex;
  align-items: center;
  gap: var(--st-global-distance-space-inset-sm);

  padding: var(--st-global-distance-space-inset-2xl);
  width: 100%;
  height: 84px;

  text-align: left;
  color: var(--st-content-foreground-color-neutral-primary);
  background-color: var(--st-content-background-color-neutral-primary);
  border: 2px solid var(--st-content-border-color-neutral-secondary);
  border-radius: var(--st-global-radius-2xl);
  cursor: pointer;

  @include mediaMinWidth('sm') {
    width: 258px;
  }

  &--selected {
    border-color: var(--st-content-foreground-color-primary-secondary);
  }

  &__icon {
    flex-shrink: 0;
    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__text {
    display: flex;
    flex-direction: column;
  }

  &__title {
    @include font('label-lg');
  }

  &__hint {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }
}
</style>
