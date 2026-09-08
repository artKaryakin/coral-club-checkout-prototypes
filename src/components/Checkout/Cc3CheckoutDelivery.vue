<script setup lang="ts">
import { computed } from 'vue'
import { useCheckout } from '@/composables/useCheckout'

import Cc3CheckoutDeliveryAddress from './Cc3CheckoutDeliveryAddress.vue'
import Cc3CheckoutDeliveryMethodCard from './Cc3CheckoutDeliveryMethodCard.vue'
import Cc3CheckoutDeliveryVariant from './Cc3CheckoutDeliveryVariant.vue'
import Cc3CheckoutPickup from './Cc3CheckoutPickup.vue'
import { useStand } from '@/stand/composables/useStand'

const { t } = useStand()

const text = computed(() => ({
  title: t('delivery.title'),
  courier: t('delivery.courier.title'),
  courierEta: t('delivery.courier.eta'),
  pickup: t('delivery.pickup.title'),
  pickupEta: t('delivery.pickup.eta'),
}))


const { deliveryMethod, isPickup } = useCheckout()
</script>

<template>
  <section class="cc3-checkout-delivery">
    <h2 class="cc3-checkout-delivery__title">{{ text.title }}</h2>

    <div class="cc3-checkout-delivery__methods">
      <Cc3CheckoutDeliveryMethodCard
        icon="delivery-truck"
        :title="text.courier"
        :hint="text.courierEta"
        :selected="deliveryMethod === 'courier'"
        @select="deliveryMethod = 'courier'"
      />

      <Cc3CheckoutDeliveryMethodCard
        icon="delivery-package-01"
        :title="text.pickup"
        :hint="text.pickupEta"
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
