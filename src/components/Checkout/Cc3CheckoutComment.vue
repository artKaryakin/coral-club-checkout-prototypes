<script setup lang="ts">
import { useCheckout } from '@/composables/useCheckout'

const { orderComment } = useCheckout()
</script>

<template>
  <section class="cc3-checkout-comment">
    <h2 class="cc3-checkout-comment__title">Комментарии к заказу</h2>

    <textarea
      v-model="orderComment"
      rows="4"
      placeholder="Ваш комментарий"
      class="cc3-checkout-comment__input"
    />
  </section>
</template>

<style lang="scss">
.cc3-checkout-comment {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  &__title {
    margin: 0;

    @include font('heading-xxs');
  }

  &__input {
    padding: var(--st-global-distance-space-inset-md);
    width: 100%;

    font-family: inherit;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
    background-color: var(--st-content-background-color-neutral-primary);
    border: 2px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-sm);
    resize: vertical;

    &::placeholder {
      color: var(--st-content-foreground-color-neutral-tetriary);
    }

    &:hover {
      background-color: var(--st-content-background-color-neutral-subtle);
      border-color: var(--st-content-border-color-neutral-disable);
    }

    // #A0ADB7 — цвет из референса, точного токена ДС под него нет.
    &:focus {
      background-color: var(--st-content-background-color-neutral-subtle);
      border-color: #a0adb7;
      outline: none;
    }
  }
}
</style>
