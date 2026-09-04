<script setup lang="ts">
import { ref } from 'vue'

type Variant = {
  id: string
  label: string
}

const variants: Variant[] = [
  { id: 'courier', label: 'Курьер. 1-2 дня, бесплатно' },
  { id: 'courier-cash', label: 'Курьер с оплатой наличными, 1-2 дня, бесплатно' },
]

const selected = ref('courier')
</script>

<template>
  <fieldset class="cc3-checkout-delivery-variant">
    <legend class="cc3-checkout-delivery-variant__title">Варианты доставки</legend>

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
