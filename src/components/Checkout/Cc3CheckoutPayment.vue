<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import cardIcon from '@/assets/payment-icons/credit-card.png'
import paypalIcon from '@/assets/payment-icons/paypal.png'
import sberpayIcon from '@/assets/payment-icons/sberpay.png'
import sbpIcon from '@/assets/payment-icons/sbp.png'
import umoneyIcon from '@/assets/payment-icons/umoney.png'

import Cc3CheckoutPaymentMethodItem from './Cc3CheckoutPaymentMethodItem.vue'
import { useStand } from '@/stand/composables/useStand'
import { hasOwnPaymentMethods, usPaymentMethods } from '@/stand/config/payments'
import type { PaymentMark } from '@/stand/config/payments'

const { country, t } = useStand()

/** Иконка способа: у США — карта и PayPal, на остальных рынках — свой набор. */
const usIcons: Record<string, string> = {
  'bank-card': cardIcon,
  paypal: paypalIcon,
}

/**
 * Набор способов оплаты для США общий на все три версии стенда: респондент
 * из Штатов не должен спотыкаться о СБП и SberPay и тратить на это вопросы
 * модератору. Оплата в тесте не проверяется — она обязана быть привычной.
 */
const methods = computed<Method[]>(() => {
  if (hasOwnPaymentMethods(country.value)) {
    return usPaymentMethods.map((method) => ({
      id: method.id,
      name: t(method.labelKey),
      icon: usIcons[method.id] ?? cardIcon,
      marks: method.marks,
    }))
  }

  return [
    { id: 'sbp', name: t('payment.sbp'), icon: sbpIcon },
    { id: 'card', name: t('payment.card'), icon: cardIcon },
    { id: 'sberpay', name: 'SberPay', icon: sberpayIcon },
    { id: 'yoomoney', name: t('payment.umoney'), icon: umoneyIcon },
  ]
})

const text = computed(() => ({
  title: t('payment.title'),
}))


type Method = {
  id: string
  name: string
  icon: string
  marks?: PaymentMark[]
}

const selected = ref(methods.value[0]?.id ?? 'sbp')

// Смена страны меняет сам список: выбранного способа в нём может уже не
// быть, и тогда не выбрано ничего — возвращаем выбор на первый.
watch(methods, (list) => {
  if (!list.some((method) => method.id === selected.value)) {
    selected.value = list[0]?.id ?? ''
  }
})
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
        :marks="method.marks"
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
