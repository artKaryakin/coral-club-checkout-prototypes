<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import cardIcon from '@/assets/payment-icons/credit-card.png'
import paypalIcon from '@/assets/payment-icons/paypal.png'
import sberpayIcon from '@/assets/payment-icons/sberpay.png'
import sbpIcon from '@/assets/payment-icons/sbp.png'
import umoneyIcon from '@/assets/payment-icons/umoney.png'
import Cc3PaymentMarks from '@/components/Payment/Cc3PaymentMarks.vue'
import { useStand } from '@/stand/composables/useStand'
import { paymentMethodsFor } from '@/stand/config/payments'
import type { PaymentMark } from '@/stand/config/payments'

const { country, t } = useStand()

type Method = {
  id: string
  name: string
  icon: string
  marks?: PaymentMark[]
}

/** Иконка способа по его id — набор общий с прод-версией. */
const icons: Record<string, string> = {
  'bank-card': cardIcon,
  paypal: paypalIcon,
  sbp: sbpIcon,
  card: cardIcon,
  sberpay: sberpayIcon,
  yoomoney: umoneyIcon,
}

/**
 * Набор способов оплаты зависит от рынка и общий с прод-версией: респондент
 * проходит два-три чекаута подряд, и разные способы оплаты между ними он
 * читает как разные магазины. Сама оплата в тесте не проверяется.
 */
const methods = computed<Method[]>(() =>
  paymentMethodsFor(country.value).map((method) => ({
    id: method.id,
    name: t(method.labelKey),
    icon: icons[method.id] ?? cardIcon,
    marks: method.marks,
  })),
)

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
          <img :src="method.icon" alt="" class="cc3-modal-payment__icon" />

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

  // Все способы теперь с картинкой-логотипом, а не с иконкой из набора:
  // СБП и SberPay узнаются по своим знакам, нарисовать их иконкой нельзя.
  &__icon {
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
