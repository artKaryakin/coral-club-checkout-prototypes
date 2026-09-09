<script setup lang="ts">
import { computed } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useStand } from '@/stand/composables/useStand'

import type { DeliveryProfile } from '../Modal/deliveryProfile'

/**
 * Адресная книга инлайн-концепта по макету: один список карточек-радио
 * без поиска и без фильтра по способу — раскрывается в теле страницы,
 * без Teleport, без фиксированного позиционирования.
 */
const { t } = useStand()

const text = computed(() => ({
  addAddress: t('delivery.addAddress'),
  edit: t('common.edit'),
}))

defineProps<{
  entries: DeliveryProfile[]
  selectedId?: string
}>()

const emit = defineEmits<{
  select: [id: string]
  edit: [id: string]
  add: []
}>()
</script>

<template>
  <div class="cc3-inline-address-book">
    <div class="cc3-inline-address-book__list">
      <label v-for="entry in entries" :key="entry.id" class="cc3-inline-address-book__card">
        <span class="cc3-inline-address-book__card-main">
          <span class="cc3-inline-address-book__card-type">{{ entry.typeLabel }}</span>

          <span class="cc3-inline-address-book__card-name">
            <Cc3Icon
              name="heart"
              :size="16"
              class="cc3-inline-address-book__card-heart"
              :class="{ 'cc3-inline-address-book__card-heart--active': entry.isFavorite }"
            />
            {{ entry.name }}
          </span>

          <span class="cc3-inline-address-book__card-address">{{ entry.addressLine }}</span>
          <span class="cc3-inline-address-book__card-price">{{ entry.priceLabel }}</span>

          <button
            type="button"
            class="cc3-inline-address-book__card-edit"
            @click.stop.prevent="emit('edit', entry.id)"
          >
            {{ text.edit }}
          </button>
        </span>

        <input
          type="radio"
          name="cc3-inline-address-book"
          class="cc3-inline-address-book__radio"
          :checked="entry.id === selectedId"
          @change="emit('select', entry.id)"
        />
      </label>

      <button type="button" class="cc3-inline-address-book__add" @click="emit('add')">
        <Cc3Icon name="plus-md" :size="24" />
        {{ text.addAddress }}
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.cc3-inline-address-book {
  padding: 0 var(--st-global-distance-space-inset-2xl);

  &__list {
    background-color: var(--st-content-background-color-default-subtle-normal);
    border: 1px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-md);
    overflow: hidden;
  }

  &__card {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-md);

    padding: 0 var(--st-global-distance-space-inset-2xl);
    width: 100%;

    border-bottom: 1px solid var(--st-content-border-color-neutral-implicit);
    cursor: pointer;

    &:last-of-type {
      border-bottom: none;
    }
  }

  &__card-main {
    display: flex;
    flex: 1;
    flex-direction: column;

    min-width: 0;
    padding: var(--st-global-distance-space-inset-sm) 0;
  }

  &__card-type {
    @include font('label-xs');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__card-name {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inline-xs);

    @include font('body-md');
    font-weight: 700;

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__card-heart {
    flex-shrink: 0;

    color: var(--st-content-foreground-color-neutral-tetriary);

    &--active {
      color: var(--st-content-foreground-color-positive-secondary);
    }
  }

  &__card-address {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__card-price {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__card-edit {
    padding: var(--st-global-distance-space-inset-xl) 0;
    width: 100%;

    text-align: left;

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
    background: none;
    border: none;
    cursor: pointer;
  }

  &__radio {
    flex-shrink: 0;

    @include cc3-modal-radio-control;
  }

  &__add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--st-global-distance-space-inline-sm);

    padding: var(--st-global-distance-space-inset-lg);
    width: 100%;
    height: 48px;

    @include font('label-md');

    color: var(--st-action-foreground-color-positive-normal);
    background: none;
    border: none;
    cursor: pointer;
  }
}
</style>
