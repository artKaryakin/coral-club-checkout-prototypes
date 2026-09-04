<script setup lang="ts">
import { ref } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'

import Cc3ModalDeliveryDialog from './Cc3ModalDeliveryDialog.vue'

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

const isFilled = ref(false)
const isDialogOpen = ref(false)
const selectedDate = ref(dateChips[0].value)
const selectedTime = ref(timeChips[0].value)

function openDialog() {
  isDialogOpen.value = true
}

function onConfirm() {
  isFilled.value = true
  isDialogOpen.value = false
}
</script>

<template>
  <section class="cc3-modal-delivery">
    <h2 class="cc3-modal-delivery__title">Delivery</h2>

    <div v-if="!isFilled" class="cc3-modal-delivery__empty">
      <button type="button" class="cc3-modal-delivery__add" @click="openDialog">
        <Cc3Icon name="plus-md" :size="24" />
        Add delivery address
      </button>
    </div>

    <div v-else class="cc3-modal-delivery__filled">
      <div class="cc3-modal-delivery__row">
        <span class="cc3-modal-delivery__method">Courier</span>
        <button type="button" class="cc3-modal-delivery__change" @click="openDialog">Change</button>
      </div>

      <div class="cc3-modal-delivery__info">
        <p class="cc3-modal-delivery__name">Ignat Ignatov</p>
        <p class="cc3-modal-delivery__address">
          Khoroshevskoye Sh. Street 12, Tula, Tula Region, Russia, 123321
        </p>
      </div>

      <p class="cc3-modal-delivery__price">2-3 business days 1,349 ₽</p>

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
    </div>

    <Cc3ModalDeliveryDialog
      v-if="isDialogOpen"
      @close="isDialogOpen = false"
      @confirm="onConfirm"
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
    padding: var(--st-global-distance-space-inset-xs) var(--st-global-distance-space-inset-2xl);

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
}
</style>
