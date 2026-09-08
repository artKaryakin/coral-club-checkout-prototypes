<script setup lang="ts">
import { computed } from 'vue'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'

import Cc3CheckoutAddressTabs from './Cc3CheckoutAddressTabs.vue'
import Cc3CheckoutCity from './Cc3CheckoutCity.vue'
import Cc3CheckoutComment from './Cc3CheckoutComment.vue'
import Cc3CheckoutConsent from './Cc3CheckoutConsent.vue'
import Cc3CheckoutDelivery from './Cc3CheckoutDelivery.vue'
import Cc3CheckoutPayment from './Cc3CheckoutPayment.vue'
import Cc3CheckoutRecipient from './Cc3CheckoutRecipient.vue'
import Cc3CheckoutSubmit from './Cc3CheckoutSubmit.vue'
import Cc3CheckoutSummary from './Cc3CheckoutSummary.vue'
import Cc3CheckoutWallet from './Cc3CheckoutWallet.vue'
import { useStand } from '@/stand/composables/useStand'

const { t } = useStand()

const { country } = useStand()

const text = computed(() => ({
  title: t('checkout.title'),
  countryLabel: t('checkout.countryLabel'),
  countryName: t(`country.${country.value}`),
  notice: t('checkout.notice'),
}))

</script>

<template>
  <div class="cc3-checkout">
    <header class="cc3-checkout__header">
      <h1 class="cc3-checkout__title">{{ text.title }}</h1>
      <p class="cc3-checkout__country">
        {{ text.countryLabel }} <strong>{{ text.countryName }}</strong>
        <Cc3Icon name="info-circle" :size="14" />
      </p>
    </header>

    <p class="cc3-checkout__notice">
      <Cc3Icon name="info-circle" :size="16" class="cc3-checkout__notice-icon" />
      {{ text.notice }}
    </p>

    <Cc3CheckoutAddressTabs />

    <div class="cc3-checkout__layout">
      <div class="cc3-checkout__main">
        <div class="cc3-checkout__card">
          <Cc3CheckoutRecipient />
          <Cc3CheckoutCity />
          <Cc3CheckoutDelivery />
        </div>

        <div class="cc3-checkout__card">
          <Cc3CheckoutWallet />
        </div>

        <div class="cc3-checkout__card">
          <Cc3CheckoutPayment />
        </div>

        <Cc3CheckoutComment />
        <Cc3CheckoutConsent />
        <Cc3CheckoutSubmit />
      </div>

      <Cc3CheckoutSummary class="cc3-checkout__sidebar" />
    </div>
  </div>
</template>

<style lang="scss">
.cc3-checkout {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-lg);

  margin: 0 auto;
  padding: var(--st-global-distance-space-inset-xl);
  max-width: 1040px;

  &__header {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);
  }

  &__title {
    margin: 0;

    @include font('heading-md');
  }

  &__country {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-stack-sm);

    margin: 0;

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__notice {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-stack-sm);

    margin: 0;
    padding: var(--st-global-distance-space-inset-md);

    @include font('body-xs');

    color: var(--st-asemantic-foreground-color-indigo-secondary);
    background-color: var(--st-asemantic-background-color-indigo-subtile);
    border-radius: var(--st-global-radius-sm);
  }

  &__notice-icon {
    flex-shrink: 0;
  }

  &__layout {
    display: grid;
    gap: var(--st-global-distance-space-inset-xl);
    grid-template-columns: 1fr;

    @include mediaMinWidth('md') {
      grid-template-columns: minmax(0, 1fr) 300px;
      align-items: start;
    }
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-xl);
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-xl);

    padding: var(--st-global-distance-space-inset-lg);

    background-color: var(--st-content-background-color-neutral-primary);
    border: 1px solid var(--st-content-border-color-neutral-secondary);
    border-radius: var(--st-global-radius-md);

    @include mediaMinWidth('sm') {
      padding: var(--st-global-distance-space-inset-xl);
    }
  }
}
</style>
