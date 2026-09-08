<script setup lang="ts">
import { computed } from 'vue'

import Cc3CheckboxField from '@/components/Field/Cc3CheckboxField.vue'
import Cc3InputField from '@/components/Field/Cc3InputField.vue'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import Cc3Map from '@/components/Map/Cc3Map.vue'
import Cc3MapPin from '@/components/Map/Cc3MapPin.vue'
import { useCheckout, type PickupProvider } from '@/composables/useCheckout'

import Cc3CheckoutPickupPointItem from './Cc3CheckoutPickupPointItem.vue'

const {
  pickupView,
  pickupSearch,
  pickupProviders,
  pickupPointsFormat,
  selectPickupPoint,
  togglePickupProvider,
  mapCenter,
  pickupProviderLabels,
} = useCheckout()

// Короткие подписи на метках карты — названия служб, не переводятся.
const providerPinLabels: Record<PickupProvider, string> = {
  office: 'CC',
  cdek: 'CDEK',
  fivepost: '5Post',
  kazpost: 'KZPost',
  dhl: 'DHL',
  inpost: 'InPost',
  zasilkovna: 'Zás.',
  usps: 'USPS',
}

// Службы разные в разных странах, поэтому список фильтров строится из
// пунктов текущей страны, а не задаётся руками.
const filters = computed(() =>
  Object.entries(pickupProviderLabels.value).map(([provider, label]) => ({
    provider: provider as PickupProvider,
    label,
    checked: pickupProviders.value.includes(provider as PickupProvider),
  })),
)

// Метки строятся из того же отфильтрованного списка, что и таблица,
// поэтому карта и список всегда показывают одни и те же пункты.
const mapMarkers = computed(() =>
  pickupPointsFormat.value.map((point) => ({
    id: point.id,
    lat: point.lat,
    lng: point.lng,
    // Свой вид метки нарисован только для офиса; остальные службы
    // показываются общим видом перевозчика.
    pinVariant: point.provider === 'office' ? ('office' as const) : ('cdek' as const),
    pinLabel: providerPinLabels[point.provider],
    title: `${point.name} — ${point.address}`,
  })),
)
</script>

<template>
  <div class="cc3-checkout-pickup-list">
    <h3 class="cc3-checkout-pickup-list__title">Пункт самовывоза</h3>

    <div class="cc3-checkout-pickup-list__view">
      <button
        type="button"
        class="cc3-checkout-pickup-list__view-button"
        :class="{ 'cc3-checkout-pickup-list__view-button--active': pickupView === 'map' }"
        @click="pickupView = 'map'"
      >
        <Cc3Icon name="location-map" :size="14" />
        Карта
      </button>

      <button
        type="button"
        class="cc3-checkout-pickup-list__view-button"
        :class="{ 'cc3-checkout-pickup-list__view-button--active': pickupView === 'list' }"
        @click="pickupView = 'list'"
      >
        <Cc3Icon name="layout-list" :size="14" />
        Список
      </button>
    </div>

    <label class="cc3-checkout-pickup-list__search">
      <span class="cc3-checkout-pickup-list__label">
        Найти адрес <span class="cc3-checkout-pickup-list__required">*</span>
      </span>

      <Cc3InputField v-model="pickupSearch" type="text">
        <template #prefix>
          <Cc3Icon name="search-md" :size="16" />
        </template>
      </Cc3InputField>
    </label>

    <div class="cc3-checkout-pickup-list__filters">
      <Cc3CheckboxField
        v-for="filter in filters"
        :key="filter.provider"
        :model-value="filter.checked"
        @update:model-value="togglePickupProvider(filter.provider)"
      >
        {{ filter.label }}
      </Cc3CheckboxField>
    </div>

    <div v-if="pickupView === 'map'" class="cc3-checkout-pickup-list__map">
      <Cc3Map :center="mapCenter" :zoom="9" :markers="mapMarkers" :height="360">
        <template #marker="{ marker }">
          <Cc3MapPin
            :label="marker.pinLabel"
            :variant="marker.pinVariant"
            :title="marker.title"
            @click="selectPickupPoint(marker.id)"
          />
        </template>
      </Cc3Map>

      <p class="cc3-checkout-pickup-list__map-hint">
        Нажмите на метку, чтобы выбрать пункт выдачи. Карту можно двигать и масштабировать.
      </p>
    </div>

    <div v-else class="cc3-checkout-pickup-list__points">
      <Cc3CheckoutPickupPointItem
        v-for="point in pickupPointsFormat"
        :key="point.id"
        :name="point.name"
        :address="point.address"
        :price-format="point.priceFormat"
        @select="selectPickupPoint(point.id)"
      />

      <p v-if="pickupPointsFormat.length === 0" class="cc3-checkout-pickup-list__empty">
        По заданным условиям пункты не найдены.
      </p>
    </div>
  </div>
</template>

<style lang="scss">
.cc3-checkout-pickup-list {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  &__title {
    margin: 0;

    @include font('label-md');
  }

  &__view {
    display: flex;
    gap: var(--st-global-distance-space-stack-sm);
  }

  &__view-button {
    display: inline-flex;
    align-items: center;
    gap: var(--st-global-distance-space-stack-sm);

    padding: var(--st-global-distance-space-stack-sm) var(--st-global-distance-space-inset-md);

    font-family: inherit;

    @include font('label-xs');

    color: var(--st-content-foreground-color-neutral-secondary);
    background-color: var(--st-content-background-color-neutral-primary);
    border: 1px solid var(--st-content-border-color-neutral-primary);
    border-radius: var(--st-global-radius-sm);
    cursor: pointer;

    &--active {
      color: var(--st-content-foreground-color-primary-primary);
      background-color: var(--st-action-background-color-primary-subtle);
      border-color: var(--st-content-foreground-color-primary-primary);
    }
  }

  &__label {
    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__required {
    color: var(--st-content-foreground-color-primary-primary);
  }

  &__search {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);
  }

  &__filters {
    display: grid;
    gap: var(--st-global-distance-space-stack-sm);
    grid-template-columns: 1fr;

    @include mediaMinWidth('sm') {
      grid-template-columns: auto auto;
      justify-content: start;
      gap: var(--st-global-distance-space-stack-sm) var(--st-global-distance-space-inset-xl);
    }
  }

  &__map {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);
  }

  &__map-hint {
    margin: 0;

    @include font('label-xxs');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__points {
    display: flex;
    flex-direction: column;

    padding-top: var(--st-global-distance-space-stack-sm);
  }

  &__empty {
    margin: 0;
    padding: var(--st-global-distance-space-inset-md) 0;

    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }
}
</style>
