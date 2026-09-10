<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import Cc3Map from '@/components/Map/Cc3Map.vue'
import Cc3MapPin from '@/components/Map/Cc3MapPin.vue'
import { useCheckout, type PickupProvider } from '@/composables/useCheckout'
import Cc3StandField from '@/stand/components/Cc3StandField.vue'
import { useStand } from '@/stand/composables/useStand'
import { useStandFields } from '@/stand/composables/useStandFields'
import { useStandProfile } from '@/stand/composables/useStandProfile'
import type { FieldKey } from '@/stand/config/types'
import { formatPriceRounded } from '@/utils/formatPrice'

import Cc3ModalConfirmDialog from '../Modal/Cc3ModalConfirmDialog.vue'
import type { DeliveryProfile } from '../Modal/deliveryProfile'

/**
 * Пункт самовывоза — единственная часть инлайн-концепта, которая всё ещё
 * открывается попапом: выбор точки требует карты, а карте нужен весь экран.
 * Хедер и состав шапки другие, чем в модальном попапе: вместо заголовка
 * и вкладок Courier/Pickup — переключатель Карта/Список (Артём уже завёл
 * ключи common.map/common.list под это), поиска адреса здесь нет вообще —
 * его убрали из макета.
 */
const props = defineProps<{
  editProfile?: DeliveryProfile
}>()

const emit = defineEmits<{
  close: []
  confirm: [profile: DeliveryProfile]
  delete: [id: string]
}>()

const { pickupPointsFormat, pickupProviders, togglePickupProvider, mapCenter, pickupProviderLabels } =
  useCheckout()
const { t, country } = useStand()
const { recipientValues: profileRecipient } = useStandProfile()

const text = computed(() => ({
  close: t('common.close'),
  back: t('common.back'),
  map: t('common.map'),
  list: t('common.list'),
  openUntil: t('pickup.openUntil'),
  pickupEmpty: t('pickup.empty'),
  hours: t('pickup.hours'),
  hoursWeekday: t('pickup.hours.weekday'),
  hoursWeekend: t('pickup.hours.weekend'),
  directions: t('pickup.directions'),
  contacts: t('pickup.contacts'),
  favorite: t('address.favorite'),
  recipientSection: t('group.recipient.title'),
  continue: t('common.continue'),
  save: t('common.save'),
  remove: t('common.delete'),
}))

type Step = 'picker' | 'detail'
type View = 'map' | 'list'

const step = ref<Step>(props.editProfile ? 'detail' : 'picker')
const view = ref<View>('map')

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

const selectedPickupPointId = ref(
  props.editProfile ? undefined : pickupPointsFormat.value[0]?.id,
)

function selectPoint(id: string) {
  selectedPickupPointId.value = id
}

const activePickupPoint = computed(() =>
  pickupPointsFormat.value.find((point) => point.id === selectedPickupPointId.value),
)

/**
 * Выбранный пункт всегда должен быть виден в списке. Фильтр по службе
 * и смена страны меняют состав списка — если выбранный из него выпал,
 * выбор переезжает на первый доступный. Иначе внизу висит карточка
 * пункта, которого на карте уже нет.
 */
watch([filteredPickupPoints, country], () => {
  const visible = filteredPickupPoints.value

  if (!visible.some((point) => point.id === selectedPickupPointId.value)) {
    selectedPickupPointId.value = visible[0]?.id
  }
})


const activePickupPointPriceFormatRounded = computed(() =>
  activePickupPoint.value ? formatPriceRounded(activePickupPoint.value.price) : '',
)

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
    pinVariant: point.provider === 'office' ? ('office' as const) : ('cdek' as const),
    pinLabel: pickupProviderPinLabel[point.provider],
  })),
)

type PickupDetailView = {
  title: string
  address: string
  priceLabel: string
  note?: string
  phone?: string
}

/**
 * При редактировании профиля из адресной книги (editProfile) берём данные
 * прямо из карточки — она может не совпадать ни с одним реальным пунктом
 * из pickupPointsFormat (id пункта в профиле не хранится), поэтому часы
 * работы и «как пройти» из фикстуры тут не подходят и просто не показываются.
 */
const pickupDetailView = computed<PickupDetailView | undefined>(() => {
  if (props.editProfile) {
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

function continueFromPicker() {
  step.value = 'detail'
}

function back() {
  step.value = 'picker'
}

const isFavorite = ref(props.editProfile?.isFavorite ?? false)
const isDeleteConfirmOpen = ref(false)

// Получатель показывается всегда, а не по кнопке: в пункт выдачи посылку
// нередко забирает не сам заказчик, и увидеть, кто там указан, важнее, чем
// сэкономить четыре строки экрана. Поля те же самые из конфига страны, что
// и у курьера — переиспользуем Cc3StandField, а не свою вёрстку инпутов.
const { fields: recipientFields } = useStandFields('recipient')
const recipientValues = ref<Partial<Record<FieldKey, string>>>(seedRecipient())

/**
 * Новый пункт открывается с получателем из профиля, сохранённый — со своими
 * данными. Имя разбирается на части, потому что состав полей зависит от
 * страны: в СНГ это одно поле, в Европе и США — имя и фамилия отдельно.
 */
function seedRecipient(): Partial<Record<FieldKey, string>> {
  const saved = props.editProfile

  if (!saved) {
    return { ...profileRecipient.value }
  }

  const [firstName = '', ...rest] = saved.name.trim().split(/\s+/)

  return {
    recipientName: saved.name,
    recipientFirstName: firstName,
    recipientLastName: rest.join(' '),
    recipientPhone: saved.phone,
    recipientEmail: saved.email,
  }
}

// Смена страны — другой формат телефона и другое имя по умолчанию.
watch(country, () => {
  recipientValues.value = seedRecipient()
})

const recipientDisplayName = computed(() =>
  recipientValues.value.recipientName?.trim() ||
  [recipientValues.value.recipientFirstName, recipientValues.value.recipientLastName]
    .filter(Boolean)
    .join(' '),
)

const confirmedProfile = computed<DeliveryProfile>(() => ({
  id: props.editProfile?.id ?? `profile-${Date.now()}`,
  method: 'pickup',
  typeLabel: pickupDetailView.value?.title ?? t('delivery.pickup.title'),
  name: recipientDisplayName.value,
  addressLine: pickupDetailView.value?.address ?? '',
  priceLabel: pickupDetailView.value?.priceLabel ?? '',
  isFavorite: isFavorite.value,
  phone: recipientValues.value.recipientPhone ?? '',
  email: recipientValues.value.recipientEmail ?? '',
}))

function confirm() {
  emit('confirm', confirmedProfile.value)
}

function deleteProfile() {
  isDeleteConfirmOpen.value = false

  if (props.editProfile) {
    emit('delete', props.editProfile.id)
  }
}

/**
 * Пока попап открыт, страница под ним не прокручивается — иначе на
 * телефоне палец, не попавший по содержимому попапа, возит чекаут за ней.
 */
let bodyOverflow = ''

onMounted(() => {
  bodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.body.style.overflow = bodyOverflow
})

function onOverlayKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="cc3-inline-pickup-dialog"
      role="dialog"
      aria-modal="true"
      @keydown="onOverlayKeydown"
    >
      <div class="cc3-inline-pickup-dialog__header">
        <button
          v-if="step === 'detail'"
          type="button"
          class="cc3-inline-pickup-dialog__back"
          :aria-label="text.back"
          @click="back"
        >
          <Cc3Icon name="chevron-down" :size="24" class="cc3-inline-pickup-dialog__back-icon" />
        </button>

        <div v-else class="cc3-inline-pickup-dialog__toggle">
          <button
            type="button"
            class="cc3-inline-pickup-dialog__toggle-tab"
            :class="{ 'cc3-inline-pickup-dialog__toggle-tab--active': view === 'map' }"
            @click="view = 'map'"
          >
            {{ text.map }}
          </button>
          <button
            type="button"
            class="cc3-inline-pickup-dialog__toggle-tab"
            :class="{ 'cc3-inline-pickup-dialog__toggle-tab--active': view === 'list' }"
            @click="view = 'list'"
          >
            {{ text.list }}
          </button>
        </div>

        <button
          type="button"
          class="cc3-inline-pickup-dialog__close"
          :aria-label="text.close"
          @click="$emit('close')"
        >
          <Cc3Icon name="x-md" :size="24" />
        </button>
      </div>

      <div class="cc3-inline-pickup-dialog__body">
        <template v-if="step === 'picker'">
          <div class="cc3-inline-pickup-dialog__chips">
            <button
              v-for="filter in providerFilters"
              :key="filter.id"
              type="button"
              class="cc3-inline-pickup-dialog__chip"
              :class="{
                'cc3-inline-pickup-dialog__chip--active': isProviderFilterActive(filter.id),
              }"
              @click="onProviderFilterClick(filter.id)"
            >
              {{ filter.label }}
            </button>
          </div>

          <div v-if="view === 'map'" class="cc3-inline-pickup-dialog__map">
            <Cc3Map :center="mapCenter" :zoom="9" :markers="pickupMapMarkers" :height="380">
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

          <div v-if="filteredPickupPoints.length" class="cc3-inline-pickup-dialog__list">
            <button
              v-for="point in filteredPickupPoints"
              :key="point.id"
              type="button"
              class="cc3-inline-pickup-dialog__list-item"
              :class="{
                'cc3-inline-pickup-dialog__list-item--selected': point.id === selectedPickupPointId,
              }"
              @click="selectPoint(point.id)"
            >
              <span class="cc3-inline-pickup-dialog__point-name">{{ point.name }}</span>
              <span class="cc3-inline-pickup-dialog__point-address">{{ point.address }}</span>
              <span class="cc3-inline-pickup-dialog__point-meta">
                {{ text.openUntil }} · {{ point.priceFormat }}
              </span>
            </button>
          </div>

          <p v-else class="cc3-inline-pickup-dialog__empty">{{ text.pickupEmpty }}</p>
        </template>

        <template v-else-if="pickupDetailView">
          <h3 class="cc3-inline-pickup-dialog__section-title">{{ pickupDetailView.title }}</h3>

          <p class="cc3-inline-pickup-dialog__detail-address">
            {{ pickupDetailView.address }}
            <br />
            <strong>{{ pickupDetailView.priceLabel }}</strong>
          </p>

          <div class="cc3-inline-pickup-dialog__detail-block">
            <p class="cc3-inline-pickup-dialog__detail-title">{{ text.hours }}</p>
            <p class="cc3-inline-pickup-dialog__detail-text">
              {{ text.hoursWeekday }}
              <br />
              {{ text.hoursWeekend }}
            </p>
          </div>

          <div v-if="pickupDetailView.note" class="cc3-inline-pickup-dialog__detail-block">
            <p class="cc3-inline-pickup-dialog__detail-title">{{ text.directions }}</p>
            <p class="cc3-inline-pickup-dialog__detail-text">{{ pickupDetailView.note }}</p>
          </div>

          <div v-if="pickupDetailView.phone" class="cc3-inline-pickup-dialog__detail-block">
            <p class="cc3-inline-pickup-dialog__detail-title">{{ text.contacts }}</p>
            <p class="cc3-inline-pickup-dialog__detail-text">{{ pickupDetailView.phone }}</p>
          </div>

          <label class="cc3-inline-pickup-dialog__favorite">
            <span>{{ text.favorite }}</span>
            <input v-model="isFavorite" type="checkbox" class="cc3-inline-pickup-dialog__checkbox" />
          </label>

          <div class="cc3-inline-pickup-dialog__recipient">
            <h3 class="cc3-inline-pickup-dialog__section-title">{{ text.recipientSection }}</h3>

            <div class="cc3-inline-pickup-dialog__fields">
              <Cc3StandField
                v-for="field in recipientFields"
                :key="field.key"
                v-model="recipientValues[field.key]"
                :field="field"
              />
            </div>
          </div>
        </template>
      </div>

      <div class="cc3-inline-pickup-dialog__footer">
        <button
          v-if="step === 'picker'"
          type="button"
          class="cc3-inline-pickup-dialog__continue"
          :disabled="!activePickupPoint"
          @click="continueFromPicker"
        >
          {{ text.continue }}
        </button>

        <template v-else-if="editProfile">
          <button type="button" class="cc3-inline-pickup-dialog__continue" @click="confirm">
            {{ text.save }}
          </button>
          <button
            type="button"
            class="cc3-inline-pickup-dialog__delete"
            @click="isDeleteConfirmOpen = true"
          >
            {{ text.remove }}
          </button>
        </template>

        <button v-else type="button" class="cc3-inline-pickup-dialog__continue" @click="confirm">
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
.cc3-inline-pickup-dialog {
  // Teleport выносит попап в body, вне .cc3-inline-checkout — цветовая
  // схема и токены не наследуются, повторяем те же объявления, что и
  // в Cc3ModalDeliveryDialog.
  color-scheme: light;

  @include cc3-light-tokens;

  position: fixed;
  inset: 0;
  z-index: 100;

  display: flex;
  flex-direction: column;

  // Макет собран под 375px, но телефон бывает шире: на 390 по краям
  // оставалось по 8px фона, на 430 — по 28. Поэтому на телефоне блок
  // тянется во всю ширину, а рамка в 375px остаётся только на десктопе,
  // где стенд смотрят как превью мобильного экрана.
  width: 100%;

  @include mediaMinWidth('sm') {
    max-width: 375px;
  }

  height: 100dvh;
  margin: 0 auto;

  overflow-y: auto;
  overscroll-behavior: contain;

  background-color: var(--st-content-background-color-default-solid-normal);

  &__header {
    position: sticky;
    top: 0;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-md);

    padding: var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-2xl)
      var(--st-global-distance-space-inset-xl);

    background-color: var(--st-content-background-color-default-solid-normal);
  }

  &__back,
  &__close {
    display: flex;
    flex-shrink: 0;
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

  &__toggle {
    display: flex;
    flex: 1;
    gap: var(--st-global-distance-space-inset-none);

    padding: var(--st-global-distance-space-inset-xs);

    background-color: var(--st-content-background-color-neutral-onsubtle);
    border-radius: var(--st-global-radius-xl);
  }

  &__toggle-tab {
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

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-none);

    padding: 0 var(--st-global-distance-space-inset-2xl);
  }

  &__map {
    overflow: hidden;

    margin: 0 calc(var(--st-global-distance-space-inset-2xl) * -1)
      var(--st-global-distance-space-inset-xl);

    .cc3-map {
      border: none;
      border-radius: 0;
    }
  }

  // Список прокручивается сам, а не тянет за собой всё окно: в режиме карты
  // он стоит под ней, и карта должна оставаться на экране.
  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-md);

    padding-bottom: var(--st-global-distance-space-inset-xl);
    max-height: 45vh;

    overflow-y: auto;
  }

  &__point-meta {
    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__empty {
    margin: 0;

    padding-bottom: var(--st-global-distance-space-inset-xl);

    color: var(--st-content-foreground-color-neutral-tetriary);
  }

  &__list-item {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-xs);

    padding: var(--st-global-distance-space-inset-md);
    width: 100%;

    text-align: left;

    background-color: var(--st-content-background-color-default-solid-normal);
    border: 2px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-lg);
    cursor: pointer;

    &--selected {
      border-color: var(--st-action-foreground-color-positive-normal);
    }
  }

  &__chips {
    display: flex;
    flex-wrap: nowrap;
    gap: var(--st-global-distance-space-inset-md);

    padding-bottom: var(--st-global-distance-space-inset-xl);

    overflow-x: auto;
  }

  &__chip {
    flex-shrink: 0;

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

  &__checkbox {
    @include cc3-modal-check-control;
  }

  &__recipient {
    padding-top: var(--st-global-distance-space-inset-md);
  }

  &__fields {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--st-global-distance-space-inset-2xl);

    padding-bottom: var(--st-global-distance-space-inset-sm);

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

  &__continue,
  &__delete {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: var(--st-global-distance-space-inset-lg);
    width: 100%;
    height: 44px;

    font-family: inherit;

    @include font('label-md');

    border: none;
    border-radius: var(--st-global-radius-md);
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__continue {
    color: var(--st-action-foreground-color-onprimary-normal);
    background-color: var(--st-action-background-color-positive-normal);
  }

  &__delete {
    color: var(--st-action-foreground-color-neutral-normal);
    background-color: var(--st-content-background-color-default-solid-normal);
    border: 1px solid var(--st-action-border-color-neutral-subtle-normal);
  }
}
</style>
