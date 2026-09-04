<script setup lang="ts">
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'

import Cc3CheckoutSummaryProductThumb from './Cc3CheckoutSummaryProductThumb.vue'

const { orderProductsPreview, orderProductsMoreCount, summary, isSummaryDetailsOpen } =
  useCheckout()
</script>

<template>
  <button
    type="button"
    class="cc3-checkout-summary-preview"
    @click="isSummaryDetailsOpen = !isSummaryDetailsOpen"
  >
    <span class="cc3-checkout-summary-preview__row">
      <span class="cc3-checkout-summary-preview__thumbs">
        <Cc3CheckoutSummaryProductThumb
          v-for="product in orderProductsPreview"
          :key="product.id"
          :image="product.thumbImage"
          :initials="product.thumbInitials"
          :color="product.thumbColor"
          :quantity="product.quantity"
        />

        <span v-if="orderProductsMoreCount > 0" class="cc3-checkout-summary-preview__more">
          +{{ orderProductsMoreCount }}
        </span>
      </span>

      <Cc3Icon
        name="chevron-down"
        :size="16"
        class="cc3-checkout-summary-preview__chevron"
        :class="{ 'cc3-checkout-summary-preview__chevron--open': isSummaryDetailsOpen }"
      />
    </span>

    <span class="cc3-checkout-summary-preview__count">
      {{ summary.itemsCount }} товаров, {{ summary.points }} баллов
    </span>
  </button>
</template>

<style lang="scss">
.cc3-checkout-summary-preview {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-sm);

  padding: 0;
  width: 100%;

  text-align: left;
  background: none;
  border: none;
  cursor: pointer;

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-sm);
  }

  &__thumbs {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-stack-sm);
  }

  &__more {
    display: flex;
    align-items: center;

    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__count {
    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__chevron {
    flex-shrink: 0;

    color: var(--st-content-foreground-color-neutral-tetriary);
    transition: transform 0.15s ease;

    // По умолчанию стрелка смотрит вправо (сворачивание раскрывает панель),
    // при открытой панели — вниз.
    transform: rotate(-90deg);

    &--open {
      transform: rotate(0deg);
    }
  }
}
</style>
