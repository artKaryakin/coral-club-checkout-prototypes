<script setup lang="ts">
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'

const { summary, orderProductsPreview, orderProductsMoreCount, promoCode } = useCheckout()
</script>

<template>
  <section class="cc3-modal-order-summary">
    <h2 class="cc3-modal-order-summary__title">Order summary</h2>

    <button type="button" class="cc3-modal-order-summary__preview">
      <span class="cc3-modal-order-summary__thumbs">
        <span
          v-for="product in orderProductsPreview"
          :key="product.id"
          class="cc3-modal-order-summary__thumb"
        >
          <img
            v-if="product.thumbImage"
            :src="product.thumbImage"
            :alt="product.name"
            class="cc3-modal-order-summary__thumb-img"
          />
        </span>

        <span v-if="orderProductsMoreCount > 0" class="cc3-modal-order-summary__more">
          + {{ orderProductsMoreCount }} more
        </span>
      </span>

      <Cc3Icon name="chevron-down" :size="24" class="cc3-modal-order-summary__chevron" />
    </button>

    <p class="cc3-modal-order-summary__count">
      {{ summary.itemsCount }} products, {{ summary.points }} points
    </p>

    <dl class="cc3-modal-order-summary__rows">
      <div class="cc3-modal-order-summary__row">
        <dt>Subtotal ({{ summary.itemsCount }})</dt>
        <dd>{{ summary.itemsTotalFormat }}</dd>
      </div>

      <div class="cc3-modal-order-summary__row">
        <dt>Shipping</dt>
        <dd>{{ summary.deliveryFormat }}</dd>
      </div>

      <div
        v-if="summary.walletUsedFormat"
        class="cc3-modal-order-summary__row cc3-modal-order-summary__row--positive"
      >
        <dt>Coral Wallet</dt>
        <dd>-{{ summary.walletUsedFormat }}</dd>
      </div>

      <div class="cc3-modal-order-summary__row cc3-modal-order-summary__row--total">
        <dt>Total:</dt>
        <dd>{{ summary.totalFormat }}</dd>
      </div>
    </dl>

    <div class="cc3-modal-order-summary__promo">
      <input
        v-model="promoCode"
        type="text"
        placeholder="Promo code"
        class="cc3-modal-order-summary__promo-input"
      />

      <button type="button" class="cc3-modal-order-summary__promo-apply" :disabled="!promoCode">
        Apply
      </button>
    </div>
  </section>
</template>

<style lang="scss">
.cc3-modal-order-summary {
  &__title {
    margin: 0;
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl);

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__preview {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl);
    width: 100%;

    background: none;
    border: none;
    cursor: pointer;
  }

  &__thumbs {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-2xl);
  }

  &__thumb {
    display: flex;
    flex-shrink: 0;

    width: 64px;
    height: 64px;

    background-color: #f6f6f6;
    border: 1px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-x);
  }

  &__thumb-img {
    width: 100%;
    height: 100%;

    border-radius: var(--st-global-radius-x);
    object-fit: cover;
  }

  &__more {
    @include font('label-md');

    color: var(--st-content-foreground-color-neutral-primary);
    white-space: nowrap;
  }

  &__chevron {
    flex-shrink: 0;

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__count {
    margin: 0;
    padding: 0 var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-2xl);

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-2xl);

    margin: 0;
    padding: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-2xl);
  }

  &__row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;

    dt,
    dd {
      margin: 0;

      @include font('body-md');

      color: var(--st-content-foreground-color-neutral-primary);
    }
  }

  &__row--positive {
    dt,
    dd {
      color: var(--st-content-foreground-color-positive-secondary);
      font-weight: 700;
    }
  }

  &__row--total {
    dt,
    dd {
      @include font('heading-xxs');
    }
  }

  &__promo {
    display: flex;
    gap: var(--st-global-distance-space-inset-md);

    padding: 0 var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-2xl);
  }

  &__promo-input {
    flex: 1;
    min-width: 0;

    padding: var(--st-global-distance-space-inset-lg) var(--st-global-distance-space-inset-xl);

    font-family: inherit;

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-primary);
    background-color: var(--st-interaction-background-color-ghost-normal);
    border: 2px solid var(--st-interaction-border-color-neutral-normal);
    border-radius: var(--st-global-radius-sm);

    &::placeholder {
      color: var(--st-content-foreground-color-neutral-tetriary);
    }

    &:focus {
      border-color: var(--st-action-background-color-positive-normal);
      outline: none;
    }
  }

  &__promo-apply {
    padding: var(--st-global-distance-space-inset-lg);

    font-family: inherit;

    @include font('label-sm');

    color: var(--st-action-foreground-color-neutral-normal);
    background: none;
    border: 1px solid var(--st-action-foreground-color-neutral-normal);
    border-radius: var(--st-global-radius-sm);
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
