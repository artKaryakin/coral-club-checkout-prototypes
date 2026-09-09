<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

import type { DeliveryProfile } from '../Modal/deliveryProfile'
import Cc3InlineAddressBook from './Cc3InlineAddressBook.vue'
import Cc3InlineDeliveryForm from './Cc3InlineDeliveryForm.vue'
import Cc3InlinePickupDialog from './Cc3InlinePickupDialog.vue'

/**
 * Блок доставки инлайн-концепта — тот же набор состояний, что и в модальном
 * (пусто / заполнено / адресная книга / форма курьера / пункт самовывоза),
 * но адресная книга и форма курьера разворачиваются прямо в теле страницы,
 * а не попапом. Попапом остаётся только выбор пункта самовывоза — ему
 * нужна карта на весь экран (см. Cc3InlinePickupDialog).
 */
type Chip = { label: string; value: string }

const dateSlots = ['day1', 'day2', 'day3']
const timeSlots = ['time1', 'time2']

const { savedAddressBookEntries, formatMoneyRounded } = useCheckout()
const { country, user, t } = useStand()

function toProfiles(): DeliveryProfile[] {
  return savedAddressBookEntries.value.map((entry, index) => ({
    id: entry.id,
    method: entry.method,
    typeLabel: entry.methodLabel,
    fields: entry.fields,
    name: entry.fullName,
    addressLine: entry.addressLine,
    priceLabel: `${t('delivery.eta')}, ${
      entry.price > 0 ? formatMoneyRounded(entry.price) : t('delivery.free')
    }`,
    isFavorite: index === 0,
    phone: entry.phone,
    email: entry.email,
  }))
}

/** Слоты дня и времени есть только на российском рынке — как в модальном. */
const hasDeliverySlots = computed(() => country.value === 'ru')

const text = computed(() => ({
  change: t('common.change'),
  hours: t('pickup.hours'),
  hoursWeekday: t('pickup.hours.weekday'),
  hoursWeekend: t('pickup.hours.weekend'),
}))

const addressBookEntries = ref<DeliveryProfile[]>(toProfiles())

type Mode = 'summary' | 'book' | 'form'

function defaultSelectedId() {
  return addressBookEntries.value[0]?.id
}

const selectedEntryId = ref<string | undefined>(defaultSelectedId())
const editingEntryId = ref<string>()
const isPickupDialogOpen = ref(false)
const sectionRef = ref<HTMLElement>()

/**
 * Пустая книга — форма курьера разворачивается сразу, без промежуточной
 * кнопки «Добавить адрес» (в отличие от модального концепта): по макету
 * инлайна первый экран — это уже развёрнутая форма.
 */
const mode = ref<Mode>(selectedEntryId.value ? 'summary' : 'form')

watch([country, user], () => {
  addressBookEntries.value = toProfiles()
  selectedEntryId.value = defaultSelectedId()
  editingEntryId.value = undefined
  isPickupDialogOpen.value = false
  mode.value = selectedEntryId.value ? 'summary' : 'form'
})

const selectedEntry = computed(() =>
  addressBookEntries.value.find((entry) => entry.id === selectedEntryId.value),
)
const editingEntry = computed(() =>
  addressBookEntries.value.find((entry) => entry.id === editingEntryId.value),
)

/** Попап пункта самовывоза получает editProfile, только если это его профиль. */
const pickupEditProfile = computed(() =>
  editingEntry.value?.method === 'pickup' ? editingEntry.value : undefined,
)

const dateChips = computed<Chip[]>(() =>
  dateSlots.map((value) => ({ value, label: t(`delivery.slot.${value}`) })),
)
const timeChips = computed<Chip[]>(() =>
  timeSlots.map((value) => ({ value, label: t(`delivery.slot.${value}`) })),
)

const selectedDate = ref(dateSlots[0])
const selectedTime = ref(timeSlots[0])

function openBook() {
  mode.value = 'book'
}

function onCloseBook() {
  mode.value = 'summary'
}

function onAddNew() {
  editingEntryId.value = undefined
  mode.value = 'form'
}

function onEditEntry(id: string) {
  editingEntryId.value = id

  const entry = addressBookEntries.value.find((item) => item.id === id)

  if (entry?.method === 'pickup') {
    isPickupDialogOpen.value = true
  } else {
    mode.value = 'form'
  }
}

function onSelectEntry(id: string) {
  selectedEntryId.value = id
  mode.value = 'summary'
}

function onOpenPickup() {
  isPickupDialogOpen.value = true
}

function upsertProfile(profile: DeliveryProfile) {
  const index = addressBookEntries.value.findIndex((entry) => entry.id === profile.id)

  if (index === -1) {
    addressBookEntries.value = [profile, ...addressBookEntries.value]
  } else {
    addressBookEntries.value = addressBookEntries.value.map((entry) =>
      entry.id === profile.id ? profile : entry,
    )
  }

  selectedEntryId.value = profile.id
  editingEntryId.value = undefined
  isPickupDialogOpen.value = false
  mode.value = 'summary'

  // Форма курьера длиннее свёрнутой карточки: без этого после сохранения
  // страница остаётся проскроленной туда, где раньше были её нижние поля.
  void nextTick(() => sectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

function deleteEntry(id: string) {
  const wasSelected = selectedEntryId.value === id

  addressBookEntries.value = addressBookEntries.value.filter((entry) => entry.id !== id)
  editingEntryId.value = undefined
  isPickupDialogOpen.value = false

  if (wasSelected) {
    selectedEntryId.value = undefined
  }

  // Как и в модальном концепте: удалённый активный адрес не подменяем
  // молча следующим сохранённым — возвращаем в адресную книгу для явного
  // выбора. Если книга опустела совсем, показываем форму, как при первом входе.
  mode.value = addressBookEntries.value.length === 0 ? 'form' : 'book'
}
</script>

<template>
  <section ref="sectionRef" class="cc3-inline-delivery">
    <template v-if="mode === 'summary' && selectedEntry">
      <div class="cc3-inline-delivery__row">
        <span class="cc3-inline-delivery__method">{{ selectedEntry.typeLabel }}</span>
        <button type="button" class="cc3-inline-delivery__change" @click="openBook">
          {{ text.change }}
        </button>
      </div>

      <div class="cc3-inline-delivery__info">
        <p class="cc3-inline-delivery__name">{{ selectedEntry.name }}</p>
        <p class="cc3-inline-delivery__address">{{ selectedEntry.addressLine }}</p>
      </div>

      <p class="cc3-inline-delivery__price">{{ selectedEntry.priceLabel }}</p>

      <template v-if="selectedEntry.method === 'courier' && hasDeliverySlots">
        <div class="cc3-inline-delivery__chips">
          <button
            v-for="chip in dateChips"
            :key="chip.value"
            type="button"
            class="cc3-inline-delivery__chip"
            :class="{ 'cc3-inline-delivery__chip--selected': selectedDate === chip.value }"
            @click="selectedDate = chip.value"
          >
            {{ chip.label }}
          </button>
        </div>

        <div class="cc3-inline-delivery__chips">
          <button
            v-for="chip in timeChips"
            :key="chip.value"
            type="button"
            class="cc3-inline-delivery__chip"
            :class="{ 'cc3-inline-delivery__chip--selected': selectedTime === chip.value }"
            @click="selectedTime = chip.value"
          >
            {{ chip.label }}
          </button>
        </div>
      </template>

      <div v-else-if="selectedEntry.method === 'pickup'" class="cc3-inline-delivery__hours">
        <p class="cc3-inline-delivery__hours-title">{{ text.hours }}</p>
        <p class="cc3-inline-delivery__hours-text">
          {{ text.hoursWeekday }}
          <br />
          {{ text.hoursWeekend }}
        </p>
      </div>
    </template>

    <Cc3InlineAddressBook
      v-else-if="mode === 'book'"
      :entries="addressBookEntries"
      :selected-id="selectedEntryId"
      @select="onSelectEntry"
      @edit="onEditEntry"
      @add="onAddNew"
      @close="onCloseBook"
    />

    <Cc3InlineDeliveryForm
      v-else
      :edit-profile="editingEntry && editingEntry.method === 'courier' ? editingEntry : undefined"
      @confirm="upsertProfile"
      @delete="deleteEntry"
      @open-pickup="onOpenPickup"
    />

    <Cc3InlinePickupDialog
      v-if="isPickupDialogOpen"
      :edit-profile="pickupEditProfile"
      @close="isPickupDialogOpen = false"
      @confirm="upsertProfile"
      @delete="deleteEntry"
    />
  </section>
</template>

<style lang="scss">
.cc3-inline-delivery {
  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl);
  }

  &__method {
    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__change {
    padding: var(--st-global-distance-space-inset-lg);

    @include font('label-sm');

    color: var(--st-action-foreground-color-positive-normal);
    background: none;
    border: none;
    cursor: pointer;
  }

  &__info {
    padding: 0 var(--st-global-distance-space-inset-2xl);
  }

  &__name {
    margin: 0;

    @include font('body-md');
    font-weight: 700;

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__address {
    margin: 0;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__price {
    margin: 0;
    padding: var(--st-global-distance-space-inset-xs) var(--st-global-distance-space-inset-2xl)
      var(--st-global-distance-space-inset-4xl);

    @include font('body-md');
    font-weight: 700;

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-global-distance-space-inset-md);

    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl);
  }

  &__price + &__chips {
    padding-top: 0;
  }

  &__chip {
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-md);

    @include font('label-md');

    color: var(--st-action-foreground-color-neutral-normal);
    background: none;
    border: 1px solid var(--st-action-border-color-neutral-subtle-normal);
    border-radius: var(--st-global-radius-xs);
    cursor: pointer;

    &--selected {
      color: var(--st-action-foreground-color-positive-normal);
      border-color: var(--st-action-foreground-color-positive-normal);
    }
  }

  &__hours {
    padding: 0 var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-2xl);
  }

  &__hours-title {
    margin: 0 0 var(--st-global-distance-space-inset-xs);

    @include font('label-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__hours-text {
    margin: 0;

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }
}
</style>
