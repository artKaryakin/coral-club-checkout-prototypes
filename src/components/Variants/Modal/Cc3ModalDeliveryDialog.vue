<script setup lang="ts">
import { computed, ref } from 'vue'

import Cc3InputField from '@/components/Field/Cc3InputField.vue'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import Cc3Map from '@/components/Map/Cc3Map.vue'
import Cc3MapPin from '@/components/Map/Cc3MapPin.vue'
import { defaultMapCenter, useCheckout, type PickupProvider } from '@/composables/useCheckout'
import { formatPriceRounded } from '@/utils/formatPrice'

type Method = 'courier' | 'pickup'
type Step = 'search' | 'address-form' | 'pickup-detail'

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const { pickupPointsFormat, pickupProviders, togglePickupProvider } = useCheckout()

const method = ref<Method>('courier')
const step = ref<Step>('search')
const citySearch = ref('Khoroshevskoye Sh., Moscow, Russia')

// Варианты курьерской доставки — копия и цены из макета. Не то же самое,
// что Cc3CheckoutDeliveryVariant в проде: там другой текст и это
// самостоятельный сценарий, здесь — только визуальный прототип.
type CourierVariant = { id: string; title: string; caption?: string }

const courierVariants: CourierVariant[] = [
  { id: 'standard', title: 'Courier, 1-2 days, 149.00 ₽' },
  {
    id: 'express',
    title: 'Express, same-day, free',
    caption: 'Available for orders from 10:00 AM to 5:00 PM',
  },
]

const selectedCourierVariant = ref('standard')

const providerFilters: { id: PickupProvider | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'office', label: 'Company Office' },
  { id: 'cdek', label: 'SDEK' },
]

function isProviderFilterActive(id: PickupProvider | 'all') {
  return id === 'all' ? pickupProviders.value.length === 0 : pickupProviders.value.includes(id)
}

function onProviderFilterClick(id: PickupProvider | 'all') {
  if (id === 'all') {
    pickupProviders.value = []
    return
  }

  togglePickupProvider(id)
}

const filteredPickupPoints = computed(() => {
  if (pickupProviders.value.length === 0) {
    return pickupPointsFormat.value
  }

  return pickupPointsFormat.value.filter((point) => pickupProviders.value.includes(point.provider))
})

const selectedPickupPointId = ref(pickupPointsFormat.value[0]?.id)

function selectPoint(id: string) {
  selectedPickupPointId.value = id
}

const activePickupPoint = computed(() =>
  pickupPointsFormat.value.find((point) => point.id === selectedPickupPointId.value),
)

const activePickupPointPriceFormatRounded = computed(() =>
  activePickupPoint.value ? formatPriceRounded(activePickupPoint.value.price) : '',
)

// Короткая подпись внутри метки на карте.
const pickupProviderPinLabel: Record<PickupProvider, string> = {
  cdek: 'CDEK',
  office: 'CC',
  fivepost: '5Post',
}

// Полное название службы — для заголовка карточки пункта.
const pickupProviderName: Record<PickupProvider, string> = {
  cdek: 'CDEK',
  office: 'Company Office',
  fivepost: '5Post',
}

const pickupMapMarkers = computed(() =>
  filteredPickupPoints.value.map((point) => ({
    id: point.id,
    lat: point.lat,
    lng: point.lng,
    provider: point.provider,
    pinLabel: pickupProviderPinLabel[point.provider],
  })),
)

// Данные формы — демо, в общее состояние useCheckout не пишутся, чтобы
// не задевать прод (там свои recipient/deliveryAddress с другой формой).
const recipientName = ref('Ignat Ignatov')
const recipientPhone = ref('(961) 12-34-567')
const recipientEmail = ref('test@gmail.com')
const houseNumber = ref('12')
const apartment = ref('')
const floor = ref('')
const entrance = ref('')
const intercom = ref('')
const indexCode = ref('123007')
const isFavorite = ref(true)

function continueFromSearch() {
  step.value = method.value === 'courier' ? 'address-form' : 'pickup-detail'
}

function back() {
  step.value = 'search'
}

function confirm() {
  emit('confirm')
}

function onOverlayKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="cc3-modal-delivery-dialog"
      role="dialog"
      aria-modal="true"
      @keydown="onOverlayKeydown"
    >
      <div class="cc3-modal-delivery-dialog__header">
          <button
            v-if="step !== 'search'"
            type="button"
            class="cc3-modal-delivery-dialog__back"
            aria-label="Назад"
            @click="back"
          >
            <Cc3Icon name="chevron-down" :size="24" class="cc3-modal-delivery-dialog__back-icon" />
          </button>
          <span v-else class="cc3-modal-delivery-dialog__back-spacer" />

          <h2 class="cc3-modal-delivery-dialog__title">Delivery information</h2>

          <button
            type="button"
            class="cc3-modal-delivery-dialog__close"
            aria-label="Закрыть"
            @click="$emit('close')"
          >
            <Cc3Icon name="x-md" :size="24" />
          </button>
        </div>

        <div class="cc3-modal-delivery-dialog__body">
          <template v-if="step === 'search'">
            <div class="cc3-modal-delivery-dialog__tabs">
              <button
                type="button"
                class="cc3-modal-delivery-dialog__tab"
                :class="{ 'cc3-modal-delivery-dialog__tab--active': method === 'courier' }"
                @click="method = 'courier'"
              >
                Courier
              </button>
              <button
                type="button"
                class="cc3-modal-delivery-dialog__tab"
                :class="{ 'cc3-modal-delivery-dialog__tab--active': method === 'pickup' }"
                @click="method = 'pickup'"
              >
                Pickup
              </button>
            </div>

            <div class="cc3-modal-delivery-dialog__map">
              <Cc3Map
                v-if="method === 'courier'"
                :center="defaultMapCenter"
                :zoom="12"
                :markers="[{ id: 'city', lat: defaultMapCenter.lat, lng: defaultMapCenter.lng }]"
                :height="380"
              >
                <template #marker>
                  <Cc3MapPin variant="address" icon="delivery-truck" />
                </template>
              </Cc3Map>

              <Cc3Map
                v-else
                :center="defaultMapCenter"
                :zoom="12"
                :markers="pickupMapMarkers"
                :height="400"
              >
                <template #marker="{ marker }">
                  <Cc3MapPin
                    :label="marker.pinLabel"
                    :variant="marker.provider"
                    :selected="marker.id === selectedPickupPointId"
                    @click="selectPoint(marker.id)"
                  />
                </template>
              </Cc3Map>
            </div>

            <template v-if="method === 'courier'">
              <div class="cc3-modal-delivery-dialog__field">
                <span class="cc3-modal-delivery-dialog__label">
                  Find address
                  <span class="cc3-modal-delivery-dialog__required">*</span>
                </span>
                <Cc3InputField v-model="citySearch" type="text" />
              </div>

              <div class="cc3-modal-delivery-dialog__variants">
                <label
                  v-for="variant in courierVariants"
                  :key="variant.id"
                  class="cc3-modal-delivery-dialog__cell"
                >
                  <span class="cc3-modal-delivery-dialog__cell-content">
                    <span class="cc3-modal-delivery-dialog__cell-title">{{ variant.title }}</span>
                    <span v-if="variant.caption" class="cc3-modal-delivery-dialog__cell-caption">
                      {{ variant.caption }}
                    </span>
                  </span>
                  <input
                    v-model="selectedCourierVariant"
                    type="radio"
                    name="courier-variant"
                    :value="variant.id"
                    class="cc3-modal-delivery-dialog__radio"
                  />
                </label>
              </div>
            </template>

            <template v-else>
              <div class="cc3-modal-delivery-dialog__field">
                <span class="cc3-modal-delivery-dialog__label">Find address</span>
                <Cc3InputField type="text" placeholder="" />
              </div>

              <div class="cc3-modal-delivery-dialog__chips">
                <button
                  v-for="filter in providerFilters"
                  :key="filter.id"
                  type="button"
                  class="cc3-modal-delivery-dialog__chip"
                  :class="{
                    'cc3-modal-delivery-dialog__chip--active': isProviderFilterActive(filter.id),
                  }"
                  @click="onProviderFilterClick(filter.id)"
                >
                  {{ filter.label }}
                </button>
              </div>

              <button
                v-if="activePickupPoint"
                type="button"
                class="cc3-modal-delivery-dialog__point"
                @click="selectPoint(activePickupPoint.id)"
              >
                <span class="cc3-modal-delivery-dialog__point-name">
                  {{ pickupProviderName[activePickupPoint.provider] }}
                </span>
                <span class="cc3-modal-delivery-dialog__point-address">
                  {{ activePickupPoint.address }}
                </span>
                <span class="cc3-modal-delivery-dialog__point-hours">Open until 20:00</span>
              </button>
            </template>
          </template>

          <template v-else-if="step === 'address-form'">
            <h3 class="cc3-modal-delivery-dialog__section-title">Adress</h3>

            <div class="cc3-modal-delivery-dialog__field">
              <span class="cc3-modal-delivery-dialog__label">
                Find address <span class="cc3-modal-delivery-dialog__required">*</span>
              </span>
              <Cc3InputField v-model="citySearch" type="text" />
            </div>

            <div class="cc3-modal-delivery-dialog__row">
              <div class="cc3-modal-delivery-dialog__field">
                <span class="cc3-modal-delivery-dialog__label">
                  House number <span class="cc3-modal-delivery-dialog__required">*</span>
                </span>
                <Cc3InputField v-model="houseNumber" type="text" />
              </div>

              <div class="cc3-modal-delivery-dialog__field">
                <span class="cc3-modal-delivery-dialog__label">Apartment</span>
                <Cc3InputField v-model="apartment" type="text" />
              </div>
            </div>

            <div class="cc3-modal-delivery-dialog__row">
              <div class="cc3-modal-delivery-dialog__field">
                <span class="cc3-modal-delivery-dialog__label">Floor</span>
                <Cc3InputField v-model="floor" type="text" />
              </div>

              <div class="cc3-modal-delivery-dialog__field">
                <span class="cc3-modal-delivery-dialog__label">Entrance</span>
                <Cc3InputField v-model="entrance" type="text" />
              </div>
            </div>

            <div class="cc3-modal-delivery-dialog__row">
              <div class="cc3-modal-delivery-dialog__field">
                <span class="cc3-modal-delivery-dialog__label">Intercom</span>
                <Cc3InputField v-model="intercom" type="text" />
              </div>

              <div class="cc3-modal-delivery-dialog__field">
                <span class="cc3-modal-delivery-dialog__label">
                  Index <span class="cc3-modal-delivery-dialog__required">*</span>
                </span>
                <Cc3InputField v-model="indexCode" type="text" />
              </div>
            </div>

            <h3 class="cc3-modal-delivery-dialog__section-title">Recipient</h3>

            <div class="cc3-modal-delivery-dialog__field">
              <span class="cc3-modal-delivery-dialog__label">
                Name and Surname <span class="cc3-modal-delivery-dialog__required">*</span>
              </span>
              <Cc3InputField v-model="recipientName" type="text" />
            </div>

            <div class="cc3-modal-delivery-dialog__field">
              <span class="cc3-modal-delivery-dialog__label">
                Phone number <span class="cc3-modal-delivery-dialog__required">*</span>
              </span>
              <Cc3InputField v-model="recipientPhone" type="tel">
                <template #prefix>
                  <span class="cc3-modal-delivery-dialog__phone-prefix">+7</span>
                </template>
              </Cc3InputField>
            </div>

            <div class="cc3-modal-delivery-dialog__field">
              <span class="cc3-modal-delivery-dialog__label">
                email <span class="cc3-modal-delivery-dialog__required">*</span>
              </span>
              <Cc3InputField v-model="recipientEmail" type="email" />
            </div>

            <label class="cc3-modal-delivery-dialog__favorite">
              <span>Mark as favorite address</span>
              <input v-model="isFavorite" type="checkbox" class="cc3-modal-delivery-dialog__radio" />
            </label>
          </template>

          <template v-else-if="step === 'pickup-detail' && activePickupPoint">
            <h3 class="cc3-modal-delivery-dialog__section-title">
              {{ pickupProviderName[activePickupPoint.provider] }} pickup point
            </h3>

            <p class="cc3-modal-delivery-dialog__detail-address">
              {{ activePickupPoint.address }}
              <br />
              <strong>2-3 business days, {{ activePickupPointPriceFormatRounded }}</strong>
            </p>

            <div class="cc3-modal-delivery-dialog__detail-block">
              <p class="cc3-modal-delivery-dialog__detail-title">Working hours:</p>
              <p class="cc3-modal-delivery-dialog__detail-text">
                Mon-Fri 10:00 AM - 9:00 PM
                <br />
                Sat-Sun 10:00 AM - 8:00 PM
              </p>
            </div>

            <div class="cc3-modal-delivery-dialog__detail-block">
              <p class="cc3-modal-delivery-dialog__detail-title">How to get there:</p>
              <p class="cc3-modal-delivery-dialog__detail-text">{{ activePickupPoint.note }}</p>
            </div>

            <div v-if="activePickupPoint.phone" class="cc3-modal-delivery-dialog__detail-block">
              <p class="cc3-modal-delivery-dialog__detail-title">Contacts:</p>
              <p class="cc3-modal-delivery-dialog__detail-text">{{ activePickupPoint.phone }}</p>
            </div>

            <label class="cc3-modal-delivery-dialog__favorite">
              <span>Mark as favorite address</span>
              <input v-model="isFavorite" type="checkbox" class="cc3-modal-delivery-dialog__radio" />
            </label>

            <button type="button" class="cc3-modal-delivery-dialog__add-recipient">
              <Cc3Icon name="plus-md" :size="20" />
              Add recipient
            </button>
          </template>
        </div>

        <div class="cc3-modal-delivery-dialog__footer">
          <button
            v-if="step === 'search'"
            type="button"
            class="cc3-modal-delivery-dialog__continue"
            @click="continueFromSearch"
          >
            Continue
          </button>

          <button v-else type="button" class="cc3-modal-delivery-dialog__continue" @click="confirm">
            Continue
          </button>
        </div>
      </div>
  </Teleport>
</template>

<style lang="scss">
// Во макете это не боттом-шит, а полноэкранная страница-модалка
// (Figma-фрейм "Mobile/popup" 375×812 — во весь мобильный вьюпорт,
// без затемнения и скруглений).
.cc3-modal-delivery-dialog {
  // Teleport выносит модалку в body, вне .cc3-modal-checkout — цветовая
  // схема и токены не наследуются, повторяем те же объявления.
  color-scheme: light;

  @include cc3-light-tokens;

  position: fixed;
  inset: 0;
  z-index: 100;

  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 375px;
  height: 100%;
  margin: 0 auto;

  overflow-y: auto;

  background-color: var(--st-content-background-color-default-solid-normal);

  &__header {
    position: sticky;
    top: 0;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-2xl)
      var(--st-global-distance-space-inset-xl);

    background-color: var(--st-content-background-color-default-solid-normal);
  }

  &__back,
  &__close {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    color: var(--st-content-foreground-color-neutral-primary);
    background: none;
    border: none;
    cursor: pointer;
  }

  &__back-icon {
    transform: rotate(90deg);
  }

  &__back-spacer {
    width: 24px;
  }

  &__title {
    margin: 0;

    @include font('label-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-none);

    padding: 0 var(--st-global-distance-space-inset-2xl);
  }

  &__tabs {
    display: flex;
    gap: var(--st-global-distance-space-inset-none);

    margin-bottom: var(--st-global-distance-space-inset-xl);
    padding: var(--st-global-distance-space-inset-xs);

    background-color: var(--st-content-background-color-neutral-onsubtle);
    border-radius: var(--st-global-radius-xl);
  }

  &__tab {
    flex: 1;

    padding: var(--st-global-distance-space-inset-md) var(--st-global-distance-space-inset-2xl);

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-primary);
    background: none;
    border: none;
    border-radius: var(--st-global-radius-md);
    cursor: pointer;

    &--active {
      background-color: var(--st-content-background-color-default-solid-normal);
      box-shadow:
        0 1px 4px 0 rgb(4 8 13 / 8%),
        0 1px 2px 0 rgb(4 8 13 / 8%);
    }
  }

  &__map {
    overflow: hidden;

    margin: 0 calc(var(--st-global-distance-space-inset-2xl) * -1)
      var(--st-global-distance-space-inset-xl);
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-sm);

    padding: var(--st-global-distance-space-inset-xl) 0;
  }

  &__row {
    display: flex;
    gap: var(--st-global-distance-space-inset-2xl);

    .cc3-modal-delivery-dialog__field {
      flex: 1;
      min-width: 0;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 2px;

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__required {
    @include font('label-xs');

    color: var(--st-content-foreground-color-negative-primary);
  }

  &__phone-prefix {
    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__variants {
    display: flex;
    flex-direction: column;
  }

  &__cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-xl);

    padding: var(--st-global-distance-space-inset-md) 0;

    cursor: pointer;
  }

  &__cell-content {
    display: flex;
    flex-direction: column;
  }

  &__cell-title {
    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__cell-caption {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__radio {
    @include cc3-modal-check-control;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-global-distance-space-inset-md);

    padding-bottom: var(--st-global-distance-space-inset-xl);
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

  &__point {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-xs);

    padding: var(--st-global-distance-space-inset-md) 0 var(--st-global-distance-space-inset-2xl);
    width: 100%;

    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
  }

  &__point-name {
    @include font('label-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__point-address,
  &__point-hours {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__section-title {
    margin: 0;
    padding: var(--st-global-distance-space-inset-sm) 0;

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__detail-address {
    margin: 0;
    padding-bottom: var(--st-global-distance-space-inset-xl);

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__detail-block {
    padding-bottom: var(--st-global-distance-space-inset-xl);
  }

  &__detail-title {
    margin: 0 0 var(--st-global-distance-space-inset-xs);

    @include font('label-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__detail-text {
    margin: 0;

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__favorite {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-xl);

    padding: var(--st-global-distance-space-inset-xl) 0;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
    cursor: pointer;
  }

  &__add-recipient {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inline-sm);

    padding: var(--st-global-distance-space-inset-md) 0;

    @include font('label-md');

    color: var(--st-action-foreground-color-positive-normal);
    background: none;
    border: none;
    cursor: pointer;
  }

  &__footer {
    position: sticky;
    bottom: 0;

    padding: var(--st-global-distance-space-inset-2xl);

    background-color: var(--st-content-background-color-default-solid-normal);
  }

  &__continue {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: var(--st-global-distance-space-inset-lg);
    width: 100%;
    height: 44px;

    font-family: inherit;

    @include font('label-md');

    color: var(--st-action-foreground-color-onprimary-normal);
    background-color: var(--st-action-background-color-positive-normal);
    border: none;
    border-radius: var(--st-global-radius-md);
    cursor: pointer;
  }
}
</style>
