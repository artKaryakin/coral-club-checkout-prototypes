<script setup lang="ts">
import { ref } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'

import Cc3CheckoutAddressBookModal from './Cc3CheckoutAddressBookModal.vue'

type AddressMode = 'saved' | 'new'

// В реальном проекте режим влияет на источник данных получателя и адреса.
const mode = ref<AddressMode>('saved')

// У нового пользователя нет сохранённых адресов, поэтому и переключаться
// не между чем: весь блок скрывается, остаётся обычный ручной ввод.
const { clearRecipientAndAddress, hasAddressBook } = useCheckout()

const isModalOpen = ref(false)

function openAddressBook() {
  mode.value = 'saved'
  isModalOpen.value = true
}

function startNewAddress() {
  mode.value = 'new'
  isModalOpen.value = false
  clearRecipientAndAddress()
}
</script>

<template>
  <div v-if="hasAddressBook" class="cc3-checkout-address-tabs">
    <button
      type="button"
      class="cc3-checkout-address-tabs__button cc3-checkout-address-tabs__button--secondary"
      @click="openAddressBook"
    >
      <Cc3Icon name="file-01" :size="24" />
      Мои адреса
    </button>

    <button
      type="button"
      class="cc3-checkout-address-tabs__button cc3-checkout-address-tabs__button--outline"
      @click="startNewAddress"
    >
      <Cc3Icon name="plus-md" :size="24" />
      Новый адрес доставки
    </button>

    <Cc3CheckoutAddressBookModal
      v-if="isModalOpen"
      @close="isModalOpen = false"
      @new-address="startNewAddress"
    />
  </div>
</template>

<style lang="scss">
.cc3-checkout-address-tabs {
  display: flex;
  gap: var(--st-global-distance-space-stack-md);

  // Цвета состояний ниже (заливка/обводка/текст) — из референса,
  // это interaction-токены (hover), их не было в извлечённом наборе ДС.
  &__button {
    display: inline-flex;
    align-items: center;
    gap: var(--st-global-distance-space-stack-sm);

    padding: 0 var(--st-global-distance-space-inset-2xl);
    height: 48px;

    font-family: inherit;

    @include font('label-md');

    border-radius: var(--st-global-radius-lg);
    cursor: pointer;

    &--outline {
      color: #091620;
      background-color: var(--st-content-background-color-neutral-primary);
      border: 1px solid #d2d7db;

      &:hover {
        border-color: #adbac4;
      }
    }

    &--secondary {
      color: var(--st-content-foreground-color-primary-secondary);
      background-color: #fef1f0;
      border: 1px solid transparent;

      &:hover {
        color: #b93f34;
        background-color: #fde6e3;
      }
    }
  }
}
</style>
