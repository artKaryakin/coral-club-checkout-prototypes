<script setup lang="ts">
type Props = {
  name: string
  address: string

  /**
   * Уже отформатированная цена — по правилам ДС вычисления в шаблоне запрещены
   */
  priceFormat: string
}

defineProps<Props>()
defineEmits<{ select: [] }>()
</script>

<template>
  <div class="cc3-checkout-pickup-point-item">
    <div class="cc3-checkout-pickup-point-item__info">
      <span class="cc3-checkout-pickup-point-item__name">{{ name }}</span>
      <span class="cc3-checkout-pickup-point-item__address">{{ address }}</span>
    </div>

    <span class="cc3-checkout-pickup-point-item__price">{{ priceFormat }}</span>

    <button
      type="button"
      class="cc3-checkout-pickup-point-item__button"
      @click="$emit('select')"
    >
      Выбрать
    </button>
  </div>
</template>

<style lang="scss">
.cc3-checkout-pickup-point-item {
  display: grid;
  align-items: center;
  gap: var(--st-global-distance-space-inset-sm);
  grid-template-columns: 1fr auto;

  padding: var(--st-global-distance-space-inset-md) 0;

  border-bottom: 1px solid var(--st-content-border-color-neutral-secondary);

  @include mediaMinWidth('sm') {
    grid-template-columns: 1fr auto 96px;
    gap: var(--st-global-distance-space-inset-md);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    grid-column: 1 / -1;

    @include mediaMinWidth('sm') {
      grid-column: auto;
    }
  }

  &__name {
    @include font('label-xs');
  }

  &__address {
    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__price {
    @include font('label-xs');

    white-space: nowrap;
  }

  &__button {
    padding: var(--st-global-distance-space-stack-sm) var(--st-global-distance-space-inset-md);
    width: 100%;

    font-family: inherit;

    @include font('label-xs');

    color: #fff;
    background-color: var(--st-content-foreground-color-primary-primary);
    border: none;
    border-radius: var(--st-global-radius-lg);
    cursor: pointer;
  }
}
</style>
