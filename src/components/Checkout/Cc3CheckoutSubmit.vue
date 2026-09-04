<script setup lang="ts">
import { useCheckout } from '@/composables/useCheckout'

// Готовность считается в общем состоянии: приняты условия продажи
// и для самовывоза выбран пункт выдачи.
const { isReady } = useCheckout()
</script>

<template>
  <div class="cc3-checkout-submit">
    <button type="submit" class="cc3-checkout-submit__button" :disabled="!isReady">
      Перейти к оплате
    </button>

    <p class="cc3-checkout-submit__legal">
      Нажимая «Перейти к оплате», вы соглашаетесь с условиями использования сервиса Coral
      Club. С подробными условиями доставки можно ознакомиться на странице
      <a href="#" class="cc3-checkout-submit__link">доставки и оплаты</a>.
    </p>
  </div>
</template>

<style lang="scss">
.cc3-checkout-submit {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-sm);

  &__button {
    padding: var(--st-global-distance-space-inset-md);
    width: 100%;

    font-family: inherit;

    @include font('label-md');

    color: #fff;
    background-color: var(--st-content-foreground-color-primary-secondary);
    border: none;
    border-radius: var(--st-global-radius-lg);
    cursor: pointer;

    &:disabled {
      color: var(--st-content-background-color-neutral-primary);
      background-color: var(--st-action-background-color-primary-subtle);
      cursor: not-allowed;
    }
  }

  &__legal {
    margin: 0;

    @include font('label-xxs');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__link {
    color: inherit;
  }
}
</style>
