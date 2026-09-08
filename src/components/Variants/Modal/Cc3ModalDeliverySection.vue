<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

import Cc3ModalAddressBook from './Cc3ModalAddressBook.vue'
import Cc3ModalDeliveryDialog from './Cc3ModalDeliveryDialog.vue'
import type { DeliveryProfile } from './deliveryProfile'

// Даты/время после подтверждения — демо-подстановка, реального выбора слота
// пока нет ни в модалке, ни в этом блоке.
type DateChip = { label: string; value: string }
type TimeChip = { label: string; value: string }

const dateChips: DateChip[] = [
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'Aug 28, Fri', value: 'aug28' },
  { label: 'Aug 29, Sat', value: 'aug29' },
]

const timeChips: TimeChip[] = [
  { label: '12:00 PM - 11:00 PM', value: 'noon' },
  { label: '1:00 PM - 12:00 AM', value: 'afternoon' },
]

// Адресная книга приходит из ядра стенда: состав задаёт страна, наличие —
// тип пользователя. Оформление карточек по макету Figma (узел 2171:41208)
// не меняется, меняется только источник данных.
//
// Список остаётся ref, потому что диалог добавляет, правит и удаляет
// карточки по ходу сессии. При смене страны или типа пользователя он
// пересобирается заново — правки предыдущей конфигурации не протекают.
const { savedAddressBookEntries, formatMoneyRounded } = useCheckout()
const { country, user, t } = useStand()

function toProfiles(): DeliveryProfile[] {
  return savedAddressBookEntries.value.map((entry, index) => ({
    id: entry.id,
    method: entry.method,
    typeLabel: entry.methodLabel,
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

const text = computed(() => ({
  title: t('delivery.section.title'),
  addAddress: t('delivery.addAddress'),
  change: t('common.change'),
  hours: t('pickup.hours'),
  hoursWeekday: t('pickup.hours.weekday'),
  hoursWeekend: t('pickup.hours.weekend'),
}))

const addressBookEntries = ref<DeliveryProfile[]>(toProfiles())

watch([country, user], () => {
  addressBookEntries.value = toProfiles()
  selectedEntryId.value = undefined
  editingEntryId.value = undefined
})

const selectedEntryId = ref<string>()
const editingEntryId = ref<string>()
const isAddressBookOpen = ref(false)
const isDialogOpen = ref(false)
const selectedDate = ref(dateChips[0].value)
const selectedTime = ref(timeChips[0].value)

const isFilled = computed(() => selectedEntryId.value !== undefined)
const selectedEntry = computed(() =>
  addressBookEntries.value.find((entry) => entry.id === selectedEntryId.value),
)
const editingEntry = computed(() =>
  addressBookEntries.value.find((entry) => entry.id === editingEntryId.value),
)

function openAddressBook() {
  isAddressBookOpen.value = true
}

function openDialog() {
  editingEntryId.value = undefined
  isDialogOpen.value = true
}

function onSelectEntry(id: string) {
  selectedEntryId.value = id
  isAddressBookOpen.value = false
}

function onEditEntry(id: string) {
  editingEntryId.value = id
  isAddressBookOpen.value = false
  isDialogOpen.value = true
}

function onAddNew() {
  editingEntryId.value = undefined
  isAddressBookOpen.value = false
  isDialogOpen.value = true
}

function closeDialog() {
  editingEntryId.value = undefined
  isDialogOpen.value = false
}

function onDialogConfirm(profile: DeliveryProfile) {
  const index = addressBookEntries.value.findIndex((entry) => entry.id === profile.id)

  if (index === -1) {
    addressBookEntries.value = [profile, ...addressBookEntries.value]
  } else {
    addressBookEntries.value = addressBookEntries.value.map((entry) =>
      entry.id === profile.id ? profile : entry,
    )
  }

  selectedEntryId.value = profile.id
  closeDialog()
}

function onDialogDelete(id: string) {
  const wasSelected = selectedEntryId.value === id

  addressBookEntries.value = addressBookEntries.value.filter((entry) => entry.id !== id)

  if (wasSelected) {
    selectedEntryId.value = undefined
  }

  closeDialog()

  // Удалённый адрес был активным — не подставляем следующий сохранённый
  // молча (риск отправить заказ не туда), а возвращаем в адресную книгу
  // для явного выбора.
  if (wasSelected) {
    isAddressBookOpen.value = true
  }
}
</script>

<template>
  <section class="cc3-modal-delivery">
    <h2 v-if="!isFilled" class="cc3-modal-delivery__title">{{ text.title }}</h2>

    <div v-if="!isFilled" class="cc3-modal-delivery__empty">
      <button type="button" class="cc3-modal-delivery__add" @click="openDialog">
        <Cc3Icon name="plus-md" :size="24" />
        {{ text.addAddress }}
      </button>
    </div>

    <div v-else-if="selectedEntry" class="cc3-modal-delivery__filled">
      <div class="cc3-modal-delivery__row">
        <span class="cc3-modal-delivery__method">{{ selectedEntry.typeLabel }}</span>
        <button type="button" class="cc3-modal-delivery__change" @click="openAddressBook">
          {{ text.change }}
        </button>
      </div>

      <div class="cc3-modal-delivery__info">
        <p class="cc3-modal-delivery__name">{{ selectedEntry.name }}</p>
        <p class="cc3-modal-delivery__address">{{ selectedEntry.addressLine }}</p>
      </div>

      <p class="cc3-modal-delivery__price">{{ selectedEntry.priceLabel }}</p>

      <template v-if="selectedEntry.method === 'courier'">
        <div class="cc3-modal-delivery__chips">
          <button
            v-for="chip in dateChips"
            :key="chip.value"
            type="button"
            class="cc3-modal-delivery__chip"
            :class="{ 'cc3-modal-delivery__chip--selected': selectedDate === chip.value }"
            @click="selectedDate = chip.value"
          >
            {{ chip.label }}
          </button>
        </div>

        <div class="cc3-modal-delivery__chips">
          <button
            v-for="chip in timeChips"
            :key="chip.value"
            type="button"
            class="cc3-modal-delivery__chip"
            :class="{ 'cc3-modal-delivery__chip--selected': selectedTime === chip.value }"
            @click="selectedTime = chip.value"
          >
            {{ chip.label }}
          </button>
        </div>
      </template>

      <div v-else class="cc3-modal-delivery__hours">
        <p class="cc3-modal-delivery__hours-title">{{ text.hours }}</p>
        <p class="cc3-modal-delivery__hours-text">
          {{ text.hoursWeekday }}
          <br />
          {{ text.hoursWeekend }}
        </p>
      </div>
    </div>

    <Cc3ModalAddressBook
      v-if="isAddressBookOpen"
      :entries="addressBookEntries"
      :selected-id="selectedEntryId"
      @close="isAddressBookOpen = false"
      @select="onSelectEntry"
      @edit="onEditEntry"
      @add="onAddNew"
    />

    <Cc3ModalDeliveryDialog
      v-if="isDialogOpen"
      :edit-profile="editingEntry"
      @close="closeDialog"
      @confirm="onDialogConfirm"
      @delete="onDialogDelete"
    />
  </section>
</template>

<style lang="scss">
.cc3-modal-delivery {
  &__title {
    margin: 0;
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl);

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__empty {
    padding: var(--st-global-distance-space-inset-md) var(--st-global-distance-space-inset-2xl)
      var(--st-global-distance-space-inset-2xl);
  }

  &__add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--st-global-distance-space-inline-sm);

    padding: var(--st-global-distance-space-inset-xl);
    width: 100%;

    @include font('label-md');

    color: var(--st-action-foreground-color-positive-normal);
    background-color: var(--st-action-background-color-positive-subtle-normal);
    border: none;
    border-radius: var(--st-global-radius-lg);
    cursor: pointer;
  }

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
