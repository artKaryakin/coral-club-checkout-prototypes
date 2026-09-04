<script setup lang="ts">
import { ref } from 'vue'

import cardIcon from '@/assets/payment-icons/credit-card.png'
import sberpayIcon from '@/assets/payment-icons/sberpay.png'
import sbpIcon from '@/assets/payment-icons/sbp.png'
import umoneyIcon from '@/assets/payment-icons/umoney.png'

import Cc3CheckoutPaymentMethodItem from './Cc3CheckoutPaymentMethodItem.vue'

type Method = {
  id: string
  name: string
  icon: string
}

const methods: Method[] = [
  { id: 'sbp', name: 'СБП', icon: sbpIcon },
  { id: 'card', name: 'Оплата картой', icon: cardIcon },
  { id: 'sberpay', name: 'SberPay', icon: sberpayIcon },
  { id: 'yoomoney', name: 'ЮMoney', icon: umoneyIcon },
]

const selected = ref('sbp')
</script>

<template>
  <section class="cc3-checkout-payment">
    <h2 class="cc3-checkout-payment__title">Способы оплаты</h2>

    <div class="cc3-checkout-payment__list">
      <Cc3CheckoutPaymentMethodItem
        v-for="method in methods"
        :key="method.id"
        :name="method.name"
        :icon="method.icon"
        :selected="selected === method.id"
        @select="selected = method.id"
      />
    </div>
  </section>
</template>

<style lang="scss">
.cc3-checkout-payment {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  &__title {
    margin: 0;

    @include font('heading-xxs');
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);
  }
}
</style>
