<script setup lang="ts">
import { computed } from 'vue'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

const { t } = useStand()

const text = computed(() => ({
  title: t('summary.title'),
}))


const { summary, isSummaryDetailsOpen } = useCheckout()
</script>

<template>
  <button
    type="button"
    class="cc3-modal-summary-bar"
    @click="isSummaryDetailsOpen = !isSummaryDetailsOpen"
  >
    <span class="cc3-modal-summary-bar__label">
      {{ text.title }}
      <Cc3Icon
        name="chevron-down"
        :size="24"
        class="cc3-modal-summary-bar__chevron"
        :class="{ 'cc3-modal-summary-bar__chevron--open': isSummaryDetailsOpen }"
      />
    </span>

    <span class="cc3-modal-summary-bar__total">{{ summary.totalFormatRounded }}</span>
  </button>
</template>

<style lang="scss">
.cc3-modal-summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--st-global-distance-space-inset-xl);

  padding: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-2xl);
  width: 100%;

  text-align: left;
  background-color: var(--st-content-background-color-neutral-disable);
  border: none;
  cursor: pointer;

  &__label {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-md);

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__chevron {
    transition: transform 0.15s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__total {
    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }
}
</style>
