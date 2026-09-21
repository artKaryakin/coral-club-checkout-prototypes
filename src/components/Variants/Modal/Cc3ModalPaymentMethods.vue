<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import paypalIcon from '@/assets/payment-icons/paypal.png'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import Cc3PaymentMarks from '@/components/Payment/Cc3PaymentMarks.vue'
import { useStand } from '@/stand/composables/useStand'
import { hasOwnPaymentMethods, usPaymentMethods } from '@/stand/config/payments'
import type { PaymentMark } from '@/stand/config/payments'

const { country, t } = useStand()

type Method = {
  id: string
  name: string
  marks?: PaymentMark[]
}

/**
 * Набор способов оплаты зависит от рынка. На рынках, где своего набора нет,
 * остаётся тот, что достался от макета; у США он свой — карта с кошельками
 * и PayPal. Оплата в тесте не проверяется, и респондент из Штатов не должен
 * тратить внимание на способы, которых у него не бывает.
 */
const methods = computed<Method[]>(() => {
  if (hasOwnPaymentMethods(country.value)) {
    return usPaymentMethods.map((method) => ({
      id: method.id,
      name: t(method.labelKey),
      marks: method.marks,
    }))
  }

  return [
    { id: 'bank-transfer', name: t('payment.umoney') },
    { id: 'bank-card', name: t('payment.card') },
    { id: 'paypal', name: 'PayPal' },
  ]
})

const text = computed(() => ({
  title: t('payment.title'),
}))

const selected = ref(methods.value[0]?.id ?? 'bank-card')

// Смена страны меняет сам список: выбранного способа в нём может уже не
// быть, и тогда не выбрано ничего — возвращаем выбор на первый.
watch(methods, (list) => {
  if (!list.some((method) => method.id === selected.value)) {
    selected.value = list[0]?.id ?? ''
  }
})
</script>

<template>
  <section class="cc3-modal-payment">
    <h2 class="cc3-modal-payment__title">{{ text.title }}</h2>

    <div class="cc3-modal-payment__list">
      <label
        v-for="method in methods"
        :key="method.id"
        class="cc3-modal-payment__card"
        :class="{ 'cc3-modal-payment__card--selected': selected === method.id }"
      >
        <span class="cc3-modal-payment__row">
          <Cc3Icon
            v-if="method.id === 'bank-transfer'"
            name="bank"
            :size="32"
            class="cc3-modal-payment__icon cc3-modal-payment__icon--teal"
          />
          <Cc3Icon
            v-else-if="method.id === 'bank-card'"
            name="credit-card"
            :size="32"
            class="cc3-modal-payment__icon cc3-modal-payment__icon--pistachio"
          />
          <img v-else :src="paypalIcon" alt="" class="cc3-modal-payment__paypal" />

          <span class="cc3-modal-payment__name">{{ method.name }}</span>
        </span>

        <span class="cc3-modal-payment__side">
          <Cc3PaymentMarks v-if="method.marks" :marks="method.marks" />

          <input
            v-model="selected"
            type="radio"
            name="cc3-modal-payment"
            :value="method.id"
            class="cc3-modal-payment__radio"
          />
        </span>
      </label>
    </div>
  </section>
</template>

<style lang="scss">
.cc3-modal-payment {
  &__title {
    margin: 0;
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl);

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-none);

    padding: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-md)
      var(--st-global-distance-space-inset-xs);
  }

  &__card {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-md);

    margin: var(--st-global-distance-space-inset-md);
    padding: var(--st-global-distance-space-inset-2xl);

    text-align: left;
    background-color: var(--st-content-background-color-default-solid-normal);
    border: 2px solid var(--st-content-border-color-neutral-onsubtle);
    border-radius: var(--st-global-radius-2xl);
    cursor: pointer;

    &--selected {
      border-color: var(--st-action-foreground-color-positive-normal);
    }
  }

  &__row {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-md);
  }

  &__side {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-md);

    margin-left: auto;
  }

  &__radio {
    @include cc3-modal-radio-control;
  }

  &__icon {
    flex-shrink: 0;

    &--teal {
      color: var(--st-asemantic-foreground-color-teal-secondary);
    }

    &--pistachio {
      color: var(--st-asemantic-foreground-color-pistachio-secondary);
    }
  }

  &__paypal {
    flex-shrink: 0;

    width: 32px;
    height: 32px;

    border-radius: var(--st-global-radius-pill);
    object-fit: cover;
  }

  &__name {
    @include font('label-lg');

    color: var(--st-content-foreground-color-neutral-primary);
  }
}
</style>
