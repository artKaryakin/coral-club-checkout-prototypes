<script setup lang="ts">
import { computed, ref } from 'vue'

import Cc3InputField from '@/components/Field/Cc3InputField.vue'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useStand } from '@/stand/composables/useStand'

import type { DeliveryProfile, DeliveryProfileMethod } from '../Modal/deliveryProfile'

/**
 * Та же адресная книга, что и в модальном концепте (список, поиск, фильтр
 * по способу, карандаш редактирования) — но раскрывается в теле страницы,
 * без попапа: без Teleport, без фиксированного позиционирования, без
 * повторного применения токенов темы (страница уже внутри них).
 */
const { t } = useStand()

const text = computed(() => ({
  title: t('addressBook.title'),
  addAddress: t('delivery.addAddress'),
  searchPlaceholder: t('common.searchByNameAddress'),
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

type FilterId = 'all' | DeliveryProfileMethod

const filters = computed<{ id: FilterId; label: string }[]>(() => [
  { id: 'all', label: t('common.all') },
  { id: 'courier', label: t('delivery.courier.title') },
  { id: 'pickup', label: t('delivery.pickup.title') },
])

const activeFilter = ref<FilterId>('all')
const search = ref('')

function matchesEntry(entry: DeliveryProfile) {
  const byFilter = activeFilter.value === 'all' || entry.method === activeFilter.value

  const query = search.value.trim().toLowerCase()
  const byQuery =
    query.length === 0 ||
    entry.name.toLowerCase().includes(query) ||
    entry.addressLine.toLowerCase().includes(query)

  return byFilter && byQuery
}
</script>

<template>
  <div class="cc3-inline-address-book">
    <h2 class="cc3-inline-address-book__title">{{ text.title }}</h2>

    <button type="button" class="cc3-inline-address-book__add" @click="emit('add')">
      <Cc3Icon name="plus-md" :size="24" />
      {{ text.addAddress }}
    </button>

    <div class="cc3-inline-address-book__field">
      <Cc3InputField v-model="search" type="text" :placeholder="text.searchPlaceholder" />
    </div>

    <div class="cc3-inline-address-book__chips">
      <button
        v-for="filter in filters"
        :key="filter.id"
        type="button"
        class="cc3-inline-address-book__chip"
        :class="{ 'cc3-inline-address-book__chip--active': activeFilter === filter.id }"
        @click="activeFilter = filter.id"
      >
        {{ filter.label }}
      </button>
    </div>

    <div class="cc3-inline-address-book__list">
      <template v-for="entry in entries" :key="entry.id">
        <div
          v-if="matchesEntry(entry)"
          class="cc3-inline-address-book__card"
          :class="{ 'cc3-inline-address-book__card--selected': entry.id === selectedId }"
          role="button"
          tabindex="0"
          @click="emit('select', entry.id)"
          @keydown.enter="emit('select', entry.id)"
          @keydown.space.prevent="emit('select', entry.id)"
        >
          <span class="cc3-inline-address-book__card-main">
            <span class="cc3-inline-address-book__card-type">{{ entry.typeLabel }}</span>

            <span class="cc3-inline-address-book__card-name">
              <Cc3Icon
                v-if="entry.isFavorite"
                name="heart"
                :size="16"
                class="cc3-inline-address-book__card-heart"
              />
              {{ entry.name }}
            </span>

            <span class="cc3-inline-address-book__card-address">{{ entry.addressLine }}</span>
            <span class="cc3-inline-address-book__card-price">{{ entry.priceLabel }}</span>
          </span>

          <button
            type="button"
            class="cc3-inline-address-book__card-edit"
            :aria-label="text.edit"
            @click.stop="emit('edit', entry.id)"
          >
            <Cc3Icon name="edit-01" :size="24" />
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.cc3-inline-address-book {
  padding: 0 var(--st-global-distance-space-inset-2xl);

  &__title {
    margin: 0;
    padding: var(--st-global-distance-space-inset-sm) 0;

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--st-global-distance-space-inline-sm);

    margin: var(--st-global-distance-space-inset-md) 0 var(--st-global-distance-space-inset-4xl);
    padding: var(--st-global-distance-space-inset-xl);
    width: 100%;

    @include font('label-md');

    color: var(--st-action-foreground-color-positive-normal);
    background-color: var(--st-action-background-color-positive-subtle-normal);
    border: none;
    border-radius: var(--st-global-radius-lg);
    cursor: pointer;
  }

  &__field {
    padding-bottom: var(--st-global-distance-space-inset-sm);
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-global-distance-space-inset-md);

    padding: var(--st-global-distance-space-inset-sm) 0;
  }

  &__chip {
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-xl);

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-primary);
    background-color: var(--st-content-background-color-default-solid-normal);
    border: 1px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-pill);
    cursor: pointer;

    &--active {
      color: var(--st-action-foreground-color-positive-normal);
      border-color: var(--st-action-foreground-color-positive-normal);
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-md);

    padding: var(--st-global-distance-space-inset-sm) 0 var(--st-global-distance-space-inset-2xl);
  }

  &__card {
    display: flex;
    align-items: flex-start;
    gap: var(--st-global-distance-space-inset-sm);

    padding: 0 var(--st-global-distance-space-inset-2xl);
    width: 100%;

    text-align: left;

    background-color: var(--st-content-background-color-default-solid-normal);
    border: 2px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-2xl);
    cursor: pointer;

    &--selected {
      border-color: var(--st-action-foreground-color-positive-normal);
    }
  }

  &__card-main {
    display: flex;
    flex: 1;
    flex-direction: column;

    min-width: 0;
    padding: var(--st-global-distance-space-inset-lg) 0;
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

    color: var(--st-content-foreground-color-positive-secondary);
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
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    padding: var(--st-global-distance-space-inset-xl) 0;

    color: var(--st-content-foreground-color-neutral-primary);
    background: none;
    border: none;
    cursor: pointer;
  }
}
</style>
