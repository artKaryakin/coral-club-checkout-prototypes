<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'

import Cc3InputField from '@/components/Field/Cc3InputField.vue'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import Cc3Map from '@/components/Map/Cc3Map.vue'
import Cc3MapPin from '@/components/Map/Cc3MapPin.vue'
import type { MapPoint } from '@/components/Map/mapTypes'
import { useCheckout } from '@/composables/useCheckout'

// Поля-заглушки: в реальном проекте — C2Field/C2Input + карта из пакета UI.
// deliveryAddress — общее состояние: его же читает и пишет адресная книга.
const { deliveryAddress, mapCenter } = useCheckout()
const { search, houseNumber, apartment, floor, entrance, intercom, postalCode, district } =
  toRefs(deliveryAddress.value)

const isMapOpen = ref(false)
const pickedPoint = ref<MapPoint>()

const mapToggleLabel = computed(() => (isMapOpen.value ? 'Скрыть карту' : 'Выбрать на карте'))

const mapMarkers = computed(() =>
  pickedPoint.value
    ? [{ id: 'delivery-address', lat: pickedPoint.value.lat, lng: pickedPoint.value.lng }]
    : [],
)

// Координаты выбранной точки. Превратить их в адрес должен сервис геокодирования
// — он приходит вместе с картографическим провайдером, поэтому пока показываем
// сами координаты, а поля адреса заполняются вручную.
const pickedPointLabel = computed(() =>
  pickedPoint.value
    ? `${pickedPoint.value.lat.toFixed(5)}, ${pickedPoint.value.lng.toFixed(5)}`
    : '',
)

const deliveryAddressLabel = computed(() => {
  const parts = [search.value, houseNumber.value && `д. ${houseNumber.value}`, postalCode.value]

  return parts.filter(Boolean).join(', ')
})

function toggleMap() {
  isMapOpen.value = !isMapOpen.value
}

function onMapSelect(point: MapPoint) {
  pickedPoint.value = point
}
</script>

<template>
  <div class="cc3-checkout-delivery-address">
    <h3 class="cc3-checkout-delivery-address__title">Адрес</h3>

    <button type="button" class="cc3-checkout-delivery-address__map-link" @click="toggleMap">
      <Cc3Icon :name="isMapOpen ? 'x-circle' : 'location-pin'" :size="16" />
      {{ mapToggleLabel }}
    </button>

    <div v-if="isMapOpen" class="cc3-checkout-delivery-address__map">
      <Cc3Map
        :center="mapCenter"
        :zoom="10"
        :markers="mapMarkers"
        :height="320"
        @select="onMapSelect"
      >
        <template #marker>
          <Cc3MapPin variant="address" icon="delivery-truck" />
        </template>
      </Cc3Map>

      <p class="cc3-checkout-delivery-address__map-hint">
        <template v-if="pickedPointLabel">
          Точка на карте: {{ pickedPointLabel }}. Поля адреса ниже заполните вручную —
          определение адреса по координатам подключается вместе с сервисом геокодирования.
        </template>
        <template v-else>
          Нажмите на карту, чтобы отметить точку доставки. Карту можно двигать и масштабировать.
        </template>
      </p>
    </div>

    <label class="cc3-checkout-delivery-address__search">
      <span class="cc3-checkout-delivery-address__label">
        Найти адрес <span class="cc3-checkout-delivery-address__required">*</span>
        <Cc3Icon name="info-circle" :size="14" class="cc3-checkout-delivery-address__label-hint" />
      </span>
      <Cc3InputField v-model="search" type="text" placeholder="Начните вводить ваш адрес">
        <template #prefix>
          <Cc3Icon name="search-md" :size="16" />
        </template>
      </Cc3InputField>
    </label>

    <div class="cc3-checkout-delivery-address__row cc3-checkout-delivery-address__row--3">
      <label class="cc3-checkout-delivery-address__field">
        <span class="cc3-checkout-delivery-address__label">
          Номер дома <span class="cc3-checkout-delivery-address__required">*</span>
        </span>
        <Cc3InputField v-model="houseNumber" type="text" />
      </label>

      <label class="cc3-checkout-delivery-address__field">
        <span class="cc3-checkout-delivery-address__label">Квартира</span>
        <Cc3InputField v-model="apartment" type="text" />
      </label>

      <label class="cc3-checkout-delivery-address__field">
        <span class="cc3-checkout-delivery-address__label">Этаж</span>
        <Cc3InputField v-model="floor" type="text" />
      </label>
    </div>

    <div class="cc3-checkout-delivery-address__row cc3-checkout-delivery-address__row--3">
      <label class="cc3-checkout-delivery-address__field">
        <span class="cc3-checkout-delivery-address__label">Подъезд</span>
        <Cc3InputField v-model="entrance" type="text" />
      </label>

      <label class="cc3-checkout-delivery-address__field">
        <span class="cc3-checkout-delivery-address__label">Домофон</span>
        <Cc3InputField v-model="intercom" type="text" />
      </label>

      <label class="cc3-checkout-delivery-address__field">
        <span class="cc3-checkout-delivery-address__label">
          Индекс <span class="cc3-checkout-delivery-address__required">*</span>
        </span>
        <Cc3InputField v-model="postalCode" type="text" />
      </label>
    </div>

    <div class="cc3-checkout-delivery-address__row cc3-checkout-delivery-address__row--3">
      <label class="cc3-checkout-delivery-address__field">
        <span class="cc3-checkout-delivery-address__label">Район</span>
        <Cc3InputField v-model="district" type="text" />
      </label>
    </div>

    <p class="cc3-checkout-delivery-address__note">
      Если вы не смогли найти свой адрес, то введите его вручную
    </p>

    <a href="#" class="cc3-checkout-delivery-address__manual-link">
      <Cc3Icon name="edit-01" :size="16" />
      Ввести вручную
    </a>

    <div class="cc3-checkout-delivery-address__time">
      <span class="cc3-checkout-delivery-address__label">Время доставки</span>

      <div class="cc3-checkout-delivery-address__time-row">
        <span class="cc3-checkout-delivery-address__select">
          вторник, 18 августа
          <Cc3Icon name="chevron-down" :size="16" />
        </span>

        <span class="cc3-checkout-delivery-address__select">
          10:00–11:00
          <Cc3Icon name="chevron-down" :size="16" />
        </span>
      </div>
    </div>

    <div class="cc3-checkout-delivery-address__result">
      <Cc3Icon name="location-pin" :size="18" />
      <span>
        Заказ будет доставлен по адресу
        <strong class="cc3-checkout-delivery-address__result-city">
          {{ deliveryAddressLabel }}
        </strong>
      </span>
    </div>
  </div>
</template>

<style lang="scss">
.cc3-checkout-delivery-address {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-stack-md);

  &__title {
    margin: 0;

    @include font('label-sm');
  }

  &__map-link,
  &__manual-link {
    display: inline-flex;
    align-items: center;
    gap: var(--st-global-distance-space-stack-sm);
    width: fit-content;

    padding: 0;

    font-family: inherit;

    @include font('label-sm');

    color: var(--st-content-foreground-color-primary-primary);
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
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

  &__label {
    display: inline-flex;
    align-items: center;
    gap: 2px;

    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__label-hint {
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

  &__select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-stack-sm);

    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-md);
    width: 100%;

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-tetriary);
    background-color: var(--st-content-background-color-neutral-secondary);
    border: 1px solid var(--st-content-border-color-neutral-primary);
    border-radius: var(--st-global-radius-sm);
  }

  &__row {
    display: grid;
    gap: var(--st-global-distance-space-inset-md);
    grid-template-columns: repeat(2, 1fr);

    @include mediaMinWidth('sm') {
      &--3 {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);
  }

  &__note {
    margin: 0;

    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__time {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);
  }

  &__time-row {
    display: grid;
    gap: var(--st-global-distance-space-inset-md);
    grid-template-columns: 1fr;

    @include mediaMinWidth('sm') {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__result {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-stack-sm);

    padding-top: var(--st-global-distance-space-stack-sm);

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__result-city {
    display: block;
  }
}
</style>
