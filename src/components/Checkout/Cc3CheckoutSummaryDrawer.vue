<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'

import Cc3CheckoutSummaryProductsList from './Cc3CheckoutSummaryProductsList.vue'

const { isSummaryDetailsOpen } = useCheckout()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    isSummaryDetailsOpen.value = false
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="cc3-checkout-summary-drawer">
      <div
        class="cc3-checkout-summary-drawer__overlay"
        @click="isSummaryDetailsOpen = false"
      />

      <div class="cc3-checkout-summary-drawer__panel" role="dialog" aria-modal="true">
        <div class="cc3-checkout-summary-drawer__header">
          <h2 class="cc3-checkout-summary-drawer__title">Состав заказа</h2>

          <button
            type="button"
            class="cc3-checkout-summary-drawer__close"
            aria-label="Закрыть"
            @click="isSummaryDetailsOpen = false"
          >
            <Cc3Icon name="x-md" :size="20" />
          </button>
        </div>

        <Cc3CheckoutSummaryProductsList />
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss">
.cc3-checkout-summary-drawer {
  position: fixed;
  inset: 0;
  z-index: 100;

  &__overlay {
    position: fixed;
    inset: 0;

    background-color: rgb(16 24 40 / 55%);
  }

  &__panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;

    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-lg);

    padding: var(--st-global-distance-space-inset-lg);
    width: 100%;
    max-width: 380px;

    background-color: var(--st-content-background-color-neutral-primary);
    box-shadow: -20px 0 40px rgb(16 24 40 / 20%);
    overflow-y: auto;

    animation: cc3-checkout-summary-drawer-slide-in 0.2s ease-out;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    margin: 0;

    @include font('heading-xxs');
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 4px;

    color: var(--st-content-foreground-color-neutral-secondary);
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      color: var(--st-content-foreground-color-neutral-primary);
    }
  }
}

@keyframes cc3-checkout-summary-drawer-slide-in {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}
</style>
