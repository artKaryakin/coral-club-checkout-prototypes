<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import Cc3InputField from '@/components/Field/Cc3InputField.vue'
import { useCheckout } from '@/composables/useCheckout'

import Cc3CheckoutSummaryDrawer from './Cc3CheckoutSummaryDrawer.vue'
import Cc3CheckoutSummaryPreview from './Cc3CheckoutSummaryPreview.vue'
import Cc3CheckoutSummaryProductsList from './Cc3CheckoutSummaryProductsList.vue'
import { useStand } from '@/stand/composables/useStand'

const { t } = useStand()

const text = computed(() => ({
  items: t('summary.items', { count: summary.value.itemsCount }),
  delivery: t('summary.delivery'),
  pickupPoint: t('summary.pickupPoint', { code: summary.value.pickupCode ?? '' }),
  total: t('summary.total'),
  promoPlaceholder: t('summary.promoPlaceholder'),
  apply: t('common.apply'),
}))


const { summary, isSummaryDetailsOpen, promoCode } = useCheckout()

// Полный список товаров открывается по-разному в зависимости от ширины экрана:
// на десктопе — выдвижная панель (Cc3CheckoutSummaryDrawer), на мобильном —
// разворачивается прямо внутри карточки. Брейкпоинт совпадает с 'md' (768px)
// из src/styles/_breakpoints.scss.
const DESKTOP_BREAKPOINT = '(min-width: 768px)'
const isDesktopViewport = ref(false)

let mediaQuery: MediaQueryList | undefined

function onViewportChange(event: MediaQueryListEvent) {
  isDesktopViewport.value = event.matches
}

onMounted(() => {
  mediaQuery = window.matchMedia(DESKTOP_BREAKPOINT)
  isDesktopViewport.value = mediaQuery.matches
  mediaQuery.addEventListener('change', onViewportChange)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', onViewportChange)
})
</script>

<template>
  <aside class="cc3-checkout-summary">
    <Cc3CheckoutSummaryPreview />

    <!-- Мобильный вариант: список товаров разворачивается прямо в карточке -->
    <Cc3CheckoutSummaryProductsList
      v-if="!isDesktopViewport && isSummaryDetailsOpen"
      class="cc3-checkout-summary__inline-products"
    />

    <dl class="cc3-checkout-summary__rows">
      <div class="cc3-checkout-summary__row">
        <dt>{{ text.items }}</dt>
        <dd>{{ summary.itemsTotalFormat }}</dd>
      </div>

      <div class="cc3-checkout-summary__row">
        <dt>{{ text.delivery }}</dt>
        <dd>{{ summary.deliveryFormat }}</dd>
      </div>

      <div v-if="summary.pickupCode" class="cc3-checkout-summary__row">
        <dt>{{ text.pickupPoint }}</dt>
        <dd />
      </div>

      <div
        v-if="summary.walletUsedFormat"
        class="cc3-checkout-summary__row cc3-checkout-summary__row--positive"
      >
        <dt>Coral Wallet</dt>
        <dd>-{{ summary.walletUsedFormat }}</dd>
      </div>
    </dl>

    <div class="cc3-checkout-summary__row cc3-checkout-summary__row--total">
      <dt>{{ text.total }}</dt>
      <dd>{{ summary.totalFormat }}</dd>
    </div>

    <div class="cc3-checkout-summary__promo">
      <Cc3InputField v-model="promoCode" type="text" :placeholder="text.promoPlaceholder" />

      <button type="button" class="cc3-checkout-summary__promo-apply" :disabled="!promoCode">
        {{ text.apply }}
      </button>
    </div>

    <!-- Десктопный вариант: выдвижная панель поверх страницы -->
    <Cc3CheckoutSummaryDrawer v-if="isDesktopViewport && isSummaryDetailsOpen" />
  </aside>
</template>

<style lang="scss">
.cc3-checkout-summary {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  padding: var(--st-global-distance-space-inset-4xl);

  background-color: var(--st-content-background-color-neutral-primary);
  border: 1px solid var(--st-content-border-color-neutral-secondary);
  border-radius: var(--st-global-radius-md);

  @include mediaMinWidth('md') {
    position: sticky;
    top: var(--st-global-distance-space-inset-xl);
  }

  &__inline-products {
    padding-top: var(--st-global-distance-space-stack-sm);
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-2xl);

    margin: 0;
    margin-top: var(--st-global-distance-space-stack-md);
  }

  &__row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;

    dt {
      @include font('body-sm');

      color: var(--st-content-foreground-color-neutral-tetriary);
    }

    dd {
      @include font('label-sm');

      margin: 0;
    }
  }

  &__row--positive {
    dt,
    dd {
      @include font('label-sm');

      color: var(--st-content-foreground-color-positive-primary);
    }
  }

  &__row--total {
    margin-top: var(--st-global-distance-space-stack-md);

    dt,
    dd {
      @include font('heading-xxs');

      color: var(--st-content-foreground-color-neutral-primary);
    }
  }

  &__promo {
    display: flex;
    gap: var(--st-global-distance-space-stack-sm);

    margin-top: var(--st-global-distance-space-stack-md);
  }

  &__promo-apply {
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-lg);

    font-family: inherit;

    @include font('label-sm');

    color: var(--st-content-foreground-color-primary-primary);
    background-color: var(--st-action-background-color-primary-subtle);
    border: none;
    border-radius: var(--st-global-radius-lg);
    cursor: pointer;
    white-space: nowrap;

    &:disabled {
      color: var(--st-content-foreground-color-neutral-tetriary);
      background-color: var(--st-content-background-color-neutral-secondary);
      cursor: not-allowed;
    }
  }
}
</style>
