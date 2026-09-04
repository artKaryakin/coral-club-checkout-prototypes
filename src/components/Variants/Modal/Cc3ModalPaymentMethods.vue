<script setup lang="ts">
import { ref } from 'vue'

import paypalIcon from '@/assets/payment-icons/paypal.png'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'

type Method = {
  id: string
  name: string
}

const methods: Method[] = [
  { id: 'bank-transfer', name: 'Bank transfer' },
  { id: 'bank-card', name: 'Bank card' },
  { id: 'paypal', name: 'PayPal' },
]

const selected = ref('bank-transfer')
</script>

<template>
  <section class="cc3-modal-payment">
    <h2 class="cc3-modal-payment__title">Payment Methods</h2>

    <div class="cc3-modal-payment__list">
      <button
        v-for="method in methods"
        :key="method.id"
        type="button"
        class="cc3-modal-payment__card"
        :class="{ 'cc3-modal-payment__card--selected': selected === method.id }"
        @click="selected = method.id"
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

        <span v-if="method.id === 'bank-card'" class="cc3-modal-payment__brands">
          <span class="cc3-modal-payment__brand">Mastercard</span>
          <span class="cc3-modal-payment__brand">Visa</span>
        </span>
      </button>
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
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-2xl);
    align-items: flex-start;

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

  &__brands {
    display: flex;
    gap: var(--st-global-distance-space-inline-sm);
  }

  &__brand {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0 var(--st-global-distance-space-inset-xs);
    height: 24px;

    @include font('label-xxs');
    white-space: nowrap;

    color: var(--st-content-foreground-color-neutral-secondary);
    background-color: var(--st-content-background-color-default-solid-normal);
    border: 1px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-xs);
  }
}
</style>
