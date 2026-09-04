<script setup lang="ts">
import { useCheckout } from '@/composables/useCheckout'

import Cc3CheckoutSummaryProductThumb from './Cc3CheckoutSummaryProductThumb.vue'

const { orderProductsFormat } = useCheckout()
</script>

<template>
  <div class="cc3-checkout-summary-products-list">
    <ul class="cc3-checkout-summary-products-list__items">
      <li
        v-for="product in orderProductsFormat"
        :key="product.id"
        class="cc3-checkout-summary-products-list__item"
      >
        <Cc3CheckoutSummaryProductThumb
          :image="product.thumbImage"
          :initials="product.thumbInitials"
          :color="product.thumbColor"
          :quantity="product.quantity"
          :size="56"
        />

        <span class="cc3-checkout-summary-products-list__name">{{ product.name }}</span>
        <span class="cc3-checkout-summary-products-list__price">{{ product.priceFormat }}</span>
      </li>
    </ul>

    <a href="#" class="cc3-checkout-summary-products-list__continue">Продолжить покупки</a>
  </div>
</template>

<style lang="scss">
.cc3-checkout-summary-products-list {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  &__items {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-sm);

    margin: 0;
    padding: 0;

    list-style: none;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-sm);
  }

  &__name {
    flex: 1;

    @include font('body-sm');
  }

  &__price {
    @include font('label-sm');

    white-space: nowrap;
  }

  &__continue {
    @include font('body-xs');

    color: var(--st-content-foreground-color-primary-primary);
    text-decoration: none;
  }
}
</style>
