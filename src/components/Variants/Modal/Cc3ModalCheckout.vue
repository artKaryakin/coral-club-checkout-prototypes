<script setup lang="ts">
import { useCheckout } from '@/composables/useCheckout'

import Cc3ModalDeliverySection from './Cc3ModalDeliverySection.vue'
import Cc3ModalFooter from './Cc3ModalFooter.vue'
import Cc3ModalHeader from './Cc3ModalHeader.vue'
import Cc3ModalOrderSummary from './Cc3ModalOrderSummary.vue'
import Cc3ModalPaymentMethods from './Cc3ModalPaymentMethods.vue'
import Cc3ModalSummaryBar from './Cc3ModalSummaryBar.vue'

const { summary } = useCheckout()
</script>

<template>
  <div class="cc3-modal-checkout">
    <Cc3ModalHeader :cart-count="summary.itemsCount" />
    <Cc3ModalSummaryBar />

    <div class="cc3-modal-checkout__body">
      <Cc3ModalDeliverySection />
      <Cc3ModalPaymentMethods />
      <Cc3ModalOrderSummary />
      <Cc3ModalFooter />
    </div>
  </div>
</template>

<style lang="scss">
.cc3-modal-checkout {
  display: flex;
  flex-direction: column;

  margin: 0 auto;
  max-width: 375px;

  background-color: var(--st-content-background-color-default-solid-normal);

  &__body {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-md);

    padding-top: var(--st-global-distance-space-inset-2xl);
  }
}
</style>
