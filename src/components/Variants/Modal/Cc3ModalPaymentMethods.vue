<script setup lang="ts">
import { computed, ref } from 'vue'

import paypalIcon from '@/assets/payment-icons/paypal.png'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useStand } from '@/stand/composables/useStand'

const { t } = useStand()

const methods = computed<Method[]>(() => [
  { id: 'bank-transfer', name: t('payment.umoney') },
  { id: 'bank-card', name: t('payment.card') },
  { id: 'paypal', name: 'PayPal' },
])

const text = computed(() => ({
  title: t('payment.title'),
}))


type Method = {
  id: string
  name: string
}

const selected = ref('bank-transfer')
</script>

<template>
  <section class="cc3-modal-payment">
    <h2 class="cc3-modal-payment__title">{{ text.title }}</h2>

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

}
</style>
