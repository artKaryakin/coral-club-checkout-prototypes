<script setup lang="ts">
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'

type Props = {
  title: string
  badge?: string
  fullName: string
  addressLine: string
  methodLabel: string
  priceFormat: string
  selected: boolean
}

defineProps<Props>()

defineEmits<{
  select: []
  edit: []
  remove: []
}>()
</script>

<template>
  <button
    type="button"
    class="cc3-checkout-address-book-card"
    :class="{ 'cc3-checkout-address-book-card--selected': selected }"
    @click="$emit('select')"
  >
    <div class="cc3-checkout-address-book-card__header">
      <span class="cc3-checkout-address-book-card__title">{{ title }}</span>

      <span class="cc3-checkout-address-book-card__actions">
        <span
          class="cc3-checkout-address-book-card__action"
          role="button"
          tabindex="0"
          aria-label="Изменить"
          @click.stop="$emit('edit')"
          @keydown.enter.stop="$emit('edit')"
        >
          <Cc3Icon name="edit-01" :size="16" />
        </span>

        <span
          class="cc3-checkout-address-book-card__action"
          role="button"
          tabindex="0"
          aria-label="Удалить"
          @click.stop="$emit('remove')"
          @keydown.enter.stop="$emit('remove')"
        >
          <Cc3Icon name="trash" :size="16" />
        </span>
      </span>
    </div>

    <span v-if="badge" class="cc3-checkout-address-book-card__badge">{{ badge }}</span>

    <p class="cc3-checkout-address-book-card__name">{{ fullName }}</p>
    <p class="cc3-checkout-address-book-card__address">{{ addressLine }}</p>

    <div class="cc3-checkout-address-book-card__footer">
      <span class="cc3-checkout-address-book-card__method">{{ methodLabel }}</span>
      <span class="cc3-checkout-address-book-card__price">{{ priceFormat }}</span>
    </div>
  </button>
</template>

<style lang="scss">
.cc3-checkout-address-book-card {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-sm);

  padding: var(--st-global-distance-space-inset-md);
  width: 100%;

  text-align: left;
  color: var(--st-content-foreground-color-neutral-primary);
  background-color: var(--st-content-background-color-neutral-primary);
  border: 1px solid var(--st-content-border-color-neutral-secondary);
  border-radius: var(--st-global-radius-2xl);
  cursor: pointer;

  &--selected {
    border: 2px solid var(--st-content-foreground-color-primary-secondary);
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-sm);
  }

  &__title {
    @include font('label-md');
  }

  &__actions {
    display: flex;
    gap: var(--st-global-distance-space-stack-sm);

    flex-shrink: 0;
  }

  &__action {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 4px;

    color: var(--st-content-foreground-color-primary-secondary);
    cursor: pointer;

    &:hover {
      color: #b93f34;
    }
  }

  // Токены индиго-палитры — бейдж всегда одного цвета, без переключения
  // через палитровую систему (см. CLAUDE.md → Стили → Палитры).
  &__badge {
    display: inline-flex;
    align-items: center;
    width: fit-content;

    padding: 2px var(--st-global-distance-space-stack-sm);

    @include font('label-xxs');

    color: var(--st-asemantic-foreground-color-indigo-secondary);
    background-color: var(--st-asemantic-background-color-indigo-subtile);
    border-radius: 6px;
  }

  &__name,
  &__address {
    margin: 0;

    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-sm);

    padding-top: var(--st-global-distance-space-stack-sm);
  }

  &__method {
    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__price {
    flex-shrink: 0;

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-primary);
  }
}
</style>
