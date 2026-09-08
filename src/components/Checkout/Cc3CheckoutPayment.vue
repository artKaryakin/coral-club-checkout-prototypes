<script setup lang="ts">
import { computed, ref } from 'vue'

import cardIcon from '@/assets/payment-icons/credit-card.png'
import sberpayIcon from '@/assets/payment-icons/sberpay.png'
import sbpIcon from '@/assets/payment-icons/sbp.png'
import umoneyIcon from '@/assets/payment-icons/umoney.png'

import Cc3CheckoutPaymentMethodItem from './Cc3CheckoutPaymentMethodItem.vue'
import { useStand } from '@/stand/composables/useStand'

const { t } = useStand()

const methods = computed<Method[]>(() => [
  { id: 'sbp', name: t('payment.sbp'), icon: sbpIcon },
  { id: 'card', name: t('payment.card'), icon: cardIcon },
  { id: 'sberpay', name: 'SberPay', icon: sberpayIcon },
  { id: 'yoomoney', name: t('payment.umoney'), icon: umoneyIcon },
])

const text = computed(() => ({
  title: t('payment.title'),
}))


type Method = {
  id: string
  name: string
  icon: string
}

const selected = ref('sbp')
</script>

<template>
  <section class="cc3-checkout-payment">
    <h2 class="cc3-checkout-payment__title">{{ text.title }}</h2>

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
