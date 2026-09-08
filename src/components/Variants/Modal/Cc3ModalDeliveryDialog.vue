<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import Cc3InputField from '@/components/Field/Cc3InputField.vue'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import Cc3Map from '@/components/Map/Cc3Map.vue'
import Cc3MapPin from '@/components/Map/Cc3MapPin.vue'
import { useCheckout, type PickupProvider } from '@/composables/useCheckout'
import Cc3StandField from '@/stand/components/Cc3StandField.vue'
import { useStand } from '@/stand/composables/useStand'
import { useStandFields } from '@/stand/composables/useStandFields'
import type { FieldKey } from '@/stand/config/types'
import { formatPriceRounded } from '@/utils/formatPrice'

import Cc3ModalConfirmDialog from './Cc3ModalConfirmDialog.vue'
import type { DeliveryProfile } from './deliveryProfile'

type Method = 'courier' | 'pickup'
type Step = 'search' | 'address-form' | 'pickup-detail'

const props = defineProps<{
  /**
   * Если передан — диалог открывается сразу на нужном шаге редактирования
   * этого профиля (адрес для courier, карточка пункта для pickup), а не
   * с поиска. Используется кнопкой-карандашом в адресной книге.
   */
  editProfile?: DeliveryProfile
}>()

const emit = defineEmits<{
  close: []
  confirm: [profile: DeliveryProfile]
  delete: [id: string]
}>()

const { pickupPointsFormat, pickupProviders, togglePickupProvider, mapCenter, pickupProviderLabels, formatMoneyRounded } =
  useCheckout()
const { t, country } = useStand()

const text = computed(() => ({
  back: t('common.back'),
  close: t('common.close'),
  title: t('delivery.info.title'),
  courier: t('delivery.courier.title'),
  pickup: t('delivery.pickup.title'),
  findAddress: t('common.findAddress'),
  openUntil: t('pickup.openUntil'),
  addressSection: t('address.title'),
  addressPlaceholder: t('field.street.placeholder'),
  recipientSection: t('group.recipient.title'),
  favorite: t('address.favorite'),
  hours: t('pickup.hours'),
  hoursWeekday: t('pickup.hours.weekday'),
  hoursWeekend: t('pickup.hours.weekend'),
  directions: t('pickup.directions'),
  contacts: t('pickup.contacts'),
  addRecipient: t('recipient.add'),
  continue: t('common.continue'),
  save: t('common.save'),
  remove: t('common.delete'),
  filterAll: t('common.all'),
}))

function initialStep(): Step {
  if (!props.editProfile) {
    return 'search'
  }

  return props.editProfile.method === 'courier' ? 'address-form' : 'pickup-detail'
}

const method = ref<Method>(props.editProfile?.method ?? 'courier')
const step = ref<Step>(initialStep())


// Варианты курьерской доставки — копия и цены из макета. Не то же самое,
// что Cc3CheckoutDeliveryVariant в проде: там другой текст и это
// самостоятельный сценарий, здесь — только визуальный прототип.
type CourierVariant = { id: string; title: string; caption?: string }

// Стоимость обычной доставки — демо-значение; форматируется в валюте страны.
const COURIER_PRICE = 149

const courierVariants = computed<CourierVariant[]>(() => [
  {
    id: 'standard',
    title: t('delivery.variant.standard', { price: formatMoneyRounded(COURIER_PRICE) }),
  },
  {
    id: 'express',
    title: t('delivery.variant.express'),
    caption: t('delivery.variant.expressNote'),
  },
])

const selectedCourierVariant = ref('standard')

// Службы разные в разных странах, поэтому фильтры строятся из пунктов
// текущей страны, а не задаются руками.
const providerFilters = computed<{ id: PickupProvider | 'all'; label: string }[]>(() => [
  { id: 'all', label: t('common.all') },
  ...Object.entries(pickupProviderLabels.value).map(([id, label]) => ({
    id: id as PickupProvider,
    label,
  })),
])

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

type PickupDetailView = {
  title: string
  address: string
  priceLabel: string
  note?: string
  phone?: string
}

/**
 * Данные для шага pickup-detail. При редактировании профиля из адресной
 * книги (editProfile) берём их прямо из карточки — она может не совпадать
 * ни с одним реальным пунктом из pickupPointsFormat (id пункта в профиле
 * не хранится), поэтому часы работы и «как пройти» из фикстуры тут не
 * подходят и просто не показываются.
 */
const pickupDetailView = computed<PickupDetailView | undefined>(() => {
  if (props.editProfile && props.editProfile.method === 'pickup') {
    return {
      title: props.editProfile.typeLabel,
      address: props.editProfile.addressLine,
      priceLabel: props.editProfile.priceLabel,
    }
  }

  if (!activePickupPoint.value) {
    return undefined
  }

  return {
    title: pickupProviderLabels.value[activePickupPoint.value.provider],
    address: activePickupPoint.value.address,
    priceLabel: `${t('delivery.eta')}, ${activePickupPointPriceFormatRounded.value}`,
    note: activePickupPoint.value.note,
    phone: activePickupPoint.value.phone,
  }
})

// Короткая подпись внутри метки на карте — названия служб, не переводятся.
const pickupProviderPinLabel: Record<PickupProvider, string> = {
  office: 'CC',
  cdek: 'CDEK',
  fivepost: '5Post',
  kazpost: 'KZPost',
  dhl: 'DHL',
  inpost: 'InPost',
  zasilkovna: 'Zás.',
  usps: 'USPS',
}

const pickupMapMarkers = computed(() =>
  filteredPickupPoints.value.map((point) => ({
    id: point.id,
    lat: point.lat,
    lng: point.lng,
    // Свой вид метки нарисован только для офиса; остальные службы
    // показываются общим видом перевозчика.
    pinVariant: point.provider === 'office' ? ('office' as const) : ('cdek' as const),
    pinLabel: pickupProviderPinLabel[point.provider],
  })),
)

// Данные формы — демо, в общее состояние useCheckout не пишутся, чтобы
// не задевать прод (там свои recipient/deliveryAddress с другой формой).
//
// Состав полей задаёт страна, поэтому значения лежат в общем объекте по
// ключам полей, а не отдельными ref на каждое: набор ключей меняется от
// рынка к рынку. Пустое значение показывает плейсхолдер с местным
// примером — «Москва, ул. Москворечье, 43» или «350 5th Ave».
const values = ref<Partial<Record<FieldKey, string>>>({})

// Собственная вёрстка вместо Cc3StandFields (черновой заглушки ядра) —
// состав и порядок полей по-прежнему из конфига страны, а оформление,
// сетка в две колонки для half-полей и переходы между брейкпоинтами свои.
const { fields: addressFields } = useStandFields('address')
const { fields: recipientFields } = useStandFields('recipient')

function seedValues() {
  const profile = props.editProfile

  if (!profile) {
    values.value = {}

    return
  }

  const [firstName = '', ...rest] = profile.name.trim().split(/\s+/)

  values.value = {
    ...profile.fields,
    street: profile.fields?.street ?? (profile.method === 'courier' ? profile.addressLine : ''),
    recipientName: profile.name,
    recipientFirstName: firstName,
    recipientLastName: rest.join(' '),
    recipientPhone: profile.phone,
    recipientEmail: profile.email,
  }
}

seedValues()

// Смена страны — это другой набор полей и другой формат адреса.
// Значения предыдущей страны в новую форму не переносятся.
watch(country, seedValues)

/** Строка поиска на первом шаге — то же поле адреса, что и в форме. */
const addressSearch = computed({
  get: () => values.value.street ?? '',
  set: (value: string) => {
    values.value = { ...values.value, street: value }
  },
})

const recipientDisplayName = computed(() =>
  values.value.recipientName?.trim() ||
  [values.value.recipientFirstName, values.value.recipientLastName].filter(Boolean).join(' '),
)
const isFavorite = ref(props.editProfile?.isFavorite ?? true)
const isRecipientVisible = ref(false)
const isDeleteConfirmOpen = ref(false)

function continueFromSearch() {
  step.value = method.value === 'courier' ? 'address-form' : 'pickup-detail'
}

function back() {
  step.value = 'search'
}

const confirmedProfile = computed<DeliveryProfile>(() => {
  const id = props.editProfile?.id ?? `profile-${Date.now()}`

  if (method.value === 'courier') {
    const variant = courierVariants.value.find((item) => item.id === selectedCourierVariant.value)

    return {
      id,
      method: 'courier',
      typeLabel: t('delivery.method.courier'),
      name: recipientDisplayName.value,
      addressLine: values.value.street ?? '',
      priceLabel: variant?.title ?? '',
      isFavorite: isFavorite.value,
      phone: values.value.recipientPhone ?? '',
      email: values.value.recipientEmail ?? '',
    }
  }

  return {
    id,
    method: 'pickup',
    typeLabel: pickupDetailView.value?.title ?? t('delivery.pickup.title'),
    name: recipientDisplayName.value,
    addressLine: pickupDetailView.value?.address ?? '',
    priceLabel: pickupDetailView.value?.priceLabel ?? '',
    isFavorite: isFavorite.value,
    phone: values.value.recipientPhone ?? '',
    email: values.value.recipientEmail ?? '',
  }
})

function confirm() {
  emit('confirm', confirmedProfile.value)
}

function deleteProfile() {
  isDeleteConfirmOpen.value = false

  if (props.editProfile) {
    emit('delete', props.editProfile.id)
  }
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
            :aria-label="text.back"
            @click="back"
          >
            <Cc3Icon name="chevron-down" :size="24" class="cc3-modal-delivery-dialog__back-icon" />
          </button>
          <span v-else class="cc3-modal-delivery-dialog__back-spacer" />

          <h2 class="cc3-modal-delivery-dialog__title">{{ text.title }}</h2>

          <button
            type="button"
            class="cc3-modal-delivery-dialog__close"
            :aria-label="text.close"
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
                {{ text.courier }}
              </button>
              <button
                type="button"
                class="cc3-modal-delivery-dialog__tab"
                :class="{ 'cc3-modal-delivery-dialog__tab--active': method === 'pickup' }"
                @click="method = 'pickup'"
              >
                {{ text.pickup }}
              </button>
            </div>

            <div class="cc3-modal-delivery-dialog__map">
              <Cc3Map
                v-if="method === 'courier'"
                :center="mapCenter"
                :zoom="14"
                :markers="[{ id: 'city', lat: mapCenter.lat, lng: mapCenter.lng }]"
                :height="380"
              >
                <template #marker>
                  <Cc3MapPin variant="address" icon="delivery-truck" />
                </template>
              </Cc3Map>

              <Cc3Map
                v-else
                :center="mapCenter"
                :zoom="9"
                :markers="pickupMapMarkers"
                :height="380"
              >
                <template #marker="{ marker }">
                  <Cc3MapPin
                    :label="marker.pinLabel"
                    :variant="marker.pinVariant"
                    :selected="marker.id === selectedPickupPointId"
                    @click="selectPoint(marker.id)"
                  />
                </template>
              </Cc3Map>
            </div>

            <template v-if="method === 'courier'">
              <div class="cc3-modal-delivery-dialog__field">
                <span class="cc3-modal-delivery-dialog__label">
                  {{ text.findAddress }}
                  <span class="cc3-modal-delivery-dialog__required">*</span>
                </span>
                <Cc3InputField v-model="addressSearch" type="text" :placeholder="text.addressPlaceholder" />
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
                <span class="cc3-modal-delivery-dialog__label">{{ text.findAddress }}</span>
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
                  {{ activePickupPoint.name }}
                </span>
                <span class="cc3-modal-delivery-dialog__point-address">
                  {{ activePickupPoint.address }}
                </span>
                <span class="cc3-modal-delivery-dialog__point-hours">{{ text.openUntil }}</span>
              </button>
            </template>
          </template>

          <template v-else-if="step === 'address-form'">
            <h3 class="cc3-modal-delivery-dialog__section-title">{{ text.addressSection }}</h3>

            <div class="cc3-modal-delivery-dialog__fields">
              <Cc3StandField
                v-for="field in addressFields"
                :key="field.key"
                v-model="values[field.key]"
                :field="field"
              />
            </div>

            <h3 class="cc3-modal-delivery-dialog__section-title">{{ text.recipientSection }}</h3>

            <div class="cc3-modal-delivery-dialog__fields">
              <Cc3StandField
                v-for="field in recipientFields"
                :key="field.key"
                v-model="values[field.key]"
                :field="field"
              />
            </div>

            <label class="cc3-modal-delivery-dialog__favorite">
              <span>{{ text.favorite }}</span>
              <input v-model="isFavorite" type="checkbox" class="cc3-modal-delivery-dialog__checkbox" />
            </label>
          </template>

          <template v-else-if="step === 'pickup-detail' && pickupDetailView">
            <h3 class="cc3-modal-delivery-dialog__section-title">{{ pickupDetailView.title }}</h3>

            <p class="cc3-modal-delivery-dialog__detail-address">
              {{ pickupDetailView.address }}
              <br />
              <strong>{{ pickupDetailView.priceLabel }}</strong>
            </p>

            <div class="cc3-modal-delivery-dialog__detail-block">
              <p class="cc3-modal-delivery-dialog__detail-title">{{ text.hours }}</p>
              <p class="cc3-modal-delivery-dialog__detail-text">
                {{ text.hoursWeekday }}
                <br />
                {{ text.hoursWeekend }}
              </p>
            </div>

            <div v-if="pickupDetailView.note" class="cc3-modal-delivery-dialog__detail-block">
              <p class="cc3-modal-delivery-dialog__detail-title">{{ text.directions }}</p>
              <p class="cc3-modal-delivery-dialog__detail-text">{{ pickupDetailView.note }}</p>
            </div>

            <div v-if="pickupDetailView.phone" class="cc3-modal-delivery-dialog__detail-block">
              <p class="cc3-modal-delivery-dialog__detail-title">{{ text.contacts }}</p>
              <p class="cc3-modal-delivery-dialog__detail-text">{{ pickupDetailView.phone }}</p>
            </div>

            <label class="cc3-modal-delivery-dialog__favorite">
              <span>{{ text.favorite }}</span>
              <input v-model="isFavorite" type="checkbox" class="cc3-modal-delivery-dialog__checkbox" />
            </label>

            <button
              v-if="!isRecipientVisible"
              type="button"
              class="cc3-modal-delivery-dialog__add-recipient"
              @click="isRecipientVisible = true"
            >
              <Cc3Icon name="plus-md" :size="20" />
              {{ text.addRecipient }}
            </button>

            <Transition name="cc3-modal-delivery-dialog-recipient">
              <div v-if="isRecipientVisible" class="cc3-modal-delivery-dialog__recipient">
                <h3 class="cc3-modal-delivery-dialog__section-title">{{ text.recipientSection }}</h3>

                <div class="cc3-modal-delivery-dialog__fields">
                  <Cc3StandField
                    v-for="field in recipientFields"
                    :key="field.key"
                    v-model="values[field.key]"
                    :field="field"
                  />
                </div>
              </div>
            </Transition>
          </template>
        </div>

        <div class="cc3-modal-delivery-dialog__footer">
          <button
            v-if="step === 'search'"
            type="button"
            class="cc3-modal-delivery-dialog__continue"
            @click="continueFromSearch"
          >
            {{ text.continue }}
          </button>

          <template v-else-if="editProfile">
            <button type="button" class="cc3-modal-delivery-dialog__continue" @click="confirm">
              {{ text.save }}
            </button>
            <button
              type="button"
              class="cc3-modal-delivery-dialog__delete"
              @click="isDeleteConfirmOpen = true"
            >
              {{ text.remove }}
            </button>
          </template>

          <button v-else type="button" class="cc3-modal-delivery-dialog__continue" @click="confirm">
            {{ text.continue }}
          </button>
        </div>
      </div>
  </Teleport>

  <Cc3ModalConfirmDialog
    v-if="isDeleteConfirmOpen"
    message="Do you want to delete this address?"
    @confirm="deleteProfile"
    @cancel="isDeleteConfirmOpen = false"
  />
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

    // Cc3Map — общий компонент (используется и в проде), по умолчанию
    // рисует карточку с рамкой и скруглением. В этой модалке карта — на
    // весь экран без отступов, поэтому убираем их только здесь.
    .cc3-map {
      border: none;
      border-radius: 0;
    }
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
    @include cc3-modal-radio-control;
  }

  &__checkbox {
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

  &__recipient {
    padding-top: var(--st-global-distance-space-inset-md);
  }

  &__fields {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--st-global-distance-space-inset-2xl);

    padding-bottom: var(--st-global-distance-space-inset-sm);

    // half — не своя модификация, а флаг из конфига страны (см. Cc3StandField):
    // поле встаёт в половину строки, а не на всю ширину.
    .cc3-stand-field--half {
      flex: 1 1 calc(50% - var(--st-global-distance-space-inset-2xl));
      min-width: 140px;
    }
  }

  &__footer {
    position: sticky;
    bottom: 0;

    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-xl);

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

  &__delete {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: var(--st-global-distance-space-inset-lg);
    width: 100%;
    height: 44px;

    font-family: inherit;

    @include font('label-md');

    color: var(--st-action-foreground-color-neutral-normal);
    background-color: var(--st-content-background-color-default-solid-normal);
    border: 1px solid var(--st-action-border-color-neutral-subtle-normal);
    border-radius: var(--st-global-radius-md);
    cursor: pointer;
  }
}

// Плавное появление полей получателя по клику на «Add recipient» — чтобы
// было видно, что это новые поля, а не перерисовка страницы.
.cc3-modal-delivery-dialog-recipient-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.cc3-modal-delivery-dialog-recipient-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
