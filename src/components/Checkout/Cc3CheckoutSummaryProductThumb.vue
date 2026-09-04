<script setup lang="ts">
type Props = {
  /**
   * Фото товара. Если не задано — показываются initials/color
   */
  image?: string

  initials: string
  color: string
  quantity?: number
  size?: number
}

withDefaults(defineProps<Props>(), {
  image: undefined,
  quantity: 1,
  size: 48,
})
</script>

<template>
  <span class="cc3-checkout-summary-product-thumb" :style="{ width: `${size}px`, height: `${size}px` }">
    <span
      class="cc3-checkout-summary-product-thumb__frame"
      :class="{ 'cc3-checkout-summary-product-thumb__frame--image': image }"
      :style="{ backgroundColor: image ? undefined : color }"
    >
      <img v-if="image" :src="image" :alt="initials" class="cc3-checkout-summary-product-thumb__img" />
      <template v-else>{{ initials }}</template>
    </span>

    <span v-if="quantity > 1" class="cc3-checkout-summary-product-thumb__badge">
      {{ quantity }}
    </span>
  </span>
</template>

<style lang="scss">
.cc3-checkout-summary-product-thumb {
  position: relative;

  display: block;
  flex-shrink: 0;

  &__frame {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;

    @include font('label-xxs');

    color: #fff;
    border-radius: var(--st-global-radius-sm);
    overflow: hidden;

    &--image {
      background-color: var(--st-content-background-color-neutral-primary);
      border: 1px solid var(--st-content-border-color-neutral-secondary);
    }
  }

  &__img {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: cover;
  }

  &__badge {
    position: absolute;
    top: -6px;
    right: -6px;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0 4px;
    min-width: 18px;
    height: 18px;

    @include font('label-xxs');

    color: #fff;
    background-color: var(--st-content-foreground-color-positive-primary);
    border: 2px solid var(--st-content-background-color-neutral-primary);
    border-radius: 999px;
  }
}
</style>
