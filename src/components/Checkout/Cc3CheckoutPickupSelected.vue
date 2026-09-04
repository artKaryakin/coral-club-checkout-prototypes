<script setup lang="ts">
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'

type Props = {
  name: string
  address: string
  phone?: string
  note?: string
}

defineProps<Props>()
defineEmits<{ change: [] }>()
</script>

<template>
  <div class="cc3-checkout-pickup-selected">
    <p class="cc3-checkout-pickup-selected__name">Выбран {{ name }}</p>

    <p class="cc3-checkout-pickup-selected__address">{{ address }}</p>

    <div v-if="phone" class="cc3-checkout-pickup-selected__contacts">
      <span class="cc3-checkout-pickup-selected__contacts-title">Контакты:</span>
      <span class="cc3-checkout-pickup-selected__contacts-value">Телефон: {{ phone }}</span>
    </div>

    <p v-if="note" class="cc3-checkout-pickup-selected__note">
      <Cc3Icon name="info-circle" :size="16" class="cc3-checkout-pickup-selected__note-icon" />
      {{ note }}
    </p>

    <button
      type="button"
      class="cc3-checkout-pickup-selected__button"
      @click="$emit('change')"
    >
      Выбрать другой
    </button>
  </div>
</template>

<style lang="scss">
.cc3-checkout-pickup-selected {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  align-items: flex-start;

  &__name,
  &__address {
    margin: 0;

    @include font('label-sm');
  }

  &__contacts {
    display: flex;
    flex-direction: column;
    gap: 2px;

    @include font('body-xs');
  }

  &__contacts-title {
    @include font('label-xs');
  }

  &__contacts-value {
    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__note {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-stack-sm);

    margin: 0;

    @include font('body-xs');

    color: var(--st-content-foreground-color-primary-primary);
  }

  &__note-icon {
    flex-shrink: 0;
  }

  &__button {
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-xl);

    font-family: inherit;

    @include font('label-sm');

    color: #fff;
    background-color: var(--st-content-foreground-color-primary-primary);
    border: none;
    border-radius: var(--st-global-radius-lg);
    cursor: pointer;
  }
}
</style>
