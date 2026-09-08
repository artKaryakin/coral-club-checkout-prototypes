<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStand } from '@/stand/composables/useStand'

const { t } = useStand()

const variantKeys = ['courierFree', 'courierCash'] as const

const variants = computed(() =>
  variantKeys.map((key) => ({ id: key, label: t(`delivery.variant.${key}`) })),
)

const text = computed(() => ({
  title: t('delivery.variants'),
}))


const selected = ref('courierFree')
</script>

<template>
  <fieldset class="cc3-checkout-delivery-variant">
    <legend class="cc3-checkout-delivery-variant__title">{{ text.title }}</legend>

    <label
      v-for="variant in variants"
      :key="variant.id"
      class="cc3-checkout-delivery-variant__option"
    >
      <input
        v-model="selected"
        type="radio"
        name="delivery-variant"
        :value="variant.id"
        class="cc3-checkout-delivery-variant__radio"
      />
      {{ variant.label }}
    </label>
  </fieldset>
</template>

<style lang="scss">
.cc3-checkout-delivery-variant {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  margin: 0;
  padding: 0;
  border: none;

  &__title {
    padding: 0;
    margin-bottom: var(--st-global-distance-space-stack-md);

    @include font('label-sm');
  }

  &__option {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-stack-sm);

    @include font('body-sm');
  }

  &__radio {
    accent-color: var(--st-content-foreground-color-primary-secondary);
    width: 18px;
    height: 18px;
  }
}
</style>
