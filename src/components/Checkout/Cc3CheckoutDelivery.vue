<script setup lang="ts">
import { useCheckout } from '@/composables/useCheckout'

import Cc3CheckoutDeliveryAddress from './Cc3CheckoutDeliveryAddress.vue'
import Cc3CheckoutDeliveryMethodCard from './Cc3CheckoutDeliveryMethodCard.vue'
import Cc3CheckoutDeliveryVariant from './Cc3CheckoutDeliveryVariant.vue'
import Cc3CheckoutPickup from './Cc3CheckoutPickup.vue'

const { deliveryMethod, isPickup } = useCheckout()
</script>

<template>
  <section class="cc3-checkout-delivery">
    <h2 class="cc3-checkout-delivery__title">Способ получения</h2>

    <div class="cc3-checkout-delivery__methods">
      <Cc3CheckoutDeliveryMethodCard
        icon="delivery-truck"
        title="Доставка курьером"
        hint="1-2 дня"
        :selected="deliveryMethod === 'courier'"
        @select="deliveryMethod = 'courier'"
      />

      <Cc3CheckoutDeliveryMethodCard
        icon="delivery-package-01"
        title="Самовывоз"
        hint="1-3 дня"
        :selected="deliveryMethod === 'pickup'"
        @select="deliveryMethod = 'pickup'"
      />
    </div>

    <Cc3CheckoutPickup v-if="isPickup" />

    <template v-else>
      <Cc3CheckoutDeliveryVariant />

      <hr class="cc3-checkout-delivery__divider" />

      <Cc3CheckoutDeliveryAddress />
    </template>
  </section>
</template>

<style lang="scss">
.cc3-checkout-delivery {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-lg);

  margin-top: var(--st-global-distance-space-stack-md);

  &__title {
    margin: 0;

    @include font('heading-xxs');
  }

  &__methods {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-sm);

    @include mediaMinWidth('sm') {
      flex-direction: row;
    }
  }

  &__divider {
    margin: 0;

    border: none;
    border-top: 1px solid var(--st-content-border-color-neutral-secondary);
  }
}
</style>
