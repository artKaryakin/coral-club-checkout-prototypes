<script setup lang="ts">
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'

type Props = {
  name: string
  icon: string
  selected: boolean
}

defineProps<Props>()
defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    class="cc3-checkout-payment-method-item"
    :class="{ 'cc3-checkout-payment-method-item--selected': selected }"
    @click="$emit('select')"
  >
    <img :src="icon" :alt="name" class="cc3-checkout-payment-method-item__icon" />

    <span class="cc3-checkout-payment-method-item__name">{{ name }}</span>

    <Cc3Icon
      v-if="selected"
      name="x-circle"
      :size="18"
      class="cc3-checkout-payment-method-item__mark cc3-checkout-payment-method-item__mark--selected"
    />
    <span v-else class="cc3-checkout-payment-method-item__mark cc3-checkout-payment-method-item__mark--radio" />
  </button>
</template>

<style lang="scss">
.cc3-checkout-payment-method-item {
  display: flex;
  align-items: center;
  gap: var(--st-global-distance-space-inset-sm);

  padding: var(--st-global-distance-space-inset-md);
  width: 100%;

  text-align: left;
  color: var(--st-content-foreground-color-neutral-primary);
  background-color: var(--st-content-background-color-neutral-primary);
  border: 1px solid var(--st-content-border-color-neutral-secondary);
  border-radius: var(--st-global-radius-sm);
  cursor: pointer;

  &--selected {
    border-color: var(--st-content-foreground-color-primary-primary);
  }

  &__icon {
    flex-shrink: 0;

    width: 32px;
    height: 32px;
  }

  &__name {
    flex: 1;

    @include font('body-sm');
  }

  &__mark {
    flex-shrink: 0;
  }

  &__mark--selected {
    color: var(--st-content-foreground-color-primary-primary);
  }

  &__mark--radio {
    width: 18px;
    height: 18px;

    border: 1px solid var(--st-content-border-color-neutral-primary);
    border-radius: 50%;
  }
}
</style>
