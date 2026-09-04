<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import Cc3InputField from '@/components/Field/Cc3InputField.vue'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { deliveryMethodLabels, useCheckout } from '@/composables/useCheckout'
import { formatPriceRounded } from '@/utils/formatPrice'

import Cc3CheckoutAddressBookCard from './Cc3CheckoutAddressBookCard.vue'

const emit = defineEmits<{
  close: []
  newAddress: []
}>()

const { savedAddressBookEntries, applyAddressBookEntry } = useCheckout()

const search = ref('')
const highlightedId = ref<string>()

const entries = computed(() =>
  savedAddressBookEntries.value.map((entry) => ({
    ...entry,
    title: deliveryMethodLabels[entry.method],
    priceFormat: formatPriceRounded(entry.price),
  })),
)

const filteredEntries = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (query === '') {
    return entries.value
  }

  return entries.value.filter(
    (entry) =>
      entry.fullName.toLowerCase().includes(query) ||
      entry.addressLine.toLowerCase().includes(query),
  )
})

function confirmSelection() {
  if (!highlightedId.value) {
    return
  }

  applyAddressBookEntry(highlightedId.value)
  emit('close')
}

function onOverlayKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

// Пункты «Изменить» и «Удалить» — заглушки: изменение и удаление профилей
// требуют бэкенда адресной книги, здесь нет ни того, ни другого.
function onEdit() {
  // no-op: редактирование профиля подключается вместе с API адресной книги
}

function onRemove() {
  // no-op: удаление профиля подключается вместе с API адресной книги
}

onMounted(() => {
  document.addEventListener('keydown', onOverlayKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onOverlayKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="cc3-checkout-address-book-modal">
      <div class="cc3-checkout-address-book-modal__overlay" @click="$emit('close')" />

      <div class="cc3-checkout-address-book-modal__dialog" role="dialog" aria-modal="true">
        <div class="cc3-checkout-address-book-modal__header">
          <h2 class="cc3-checkout-address-book-modal__title">Все адреса</h2>

          <button
            type="button"
            class="cc3-checkout-address-book-modal__close"
            aria-label="Закрыть"
            @click="$emit('close')"
          >
            <Cc3Icon name="x-md" :size="20" />
          </button>
        </div>

        <Cc3InputField v-model="search" type="text" placeholder="Поиск">
          <template #prefix>
            <Cc3Icon name="search-md" :size="16" />
          </template>
        </Cc3InputField>

        <div class="cc3-checkout-address-book-modal__list">
          <Cc3CheckoutAddressBookCard
            v-for="entry in filteredEntries"
            :key="entry.id"
            :title="entry.title"
            :badge="entry.badge"
            :full-name="entry.fullName"
            :address-line="entry.addressLine"
            :method-label="entry.methodLabel"
            :price-format="entry.priceFormat"
            :selected="highlightedId === entry.id"
            @select="highlightedId = entry.id"
            @edit="onEdit"
            @remove="onRemove"
          />

          <p v-if="filteredEntries.length === 0" class="cc3-checkout-address-book-modal__empty">
            По запросу «{{ search }}» ничего не найдено.
          </p>
        </div>

        <div class="cc3-checkout-address-book-modal__footer">
          <button
            type="button"
            class="cc3-checkout-address-book-modal__submit"
            :disabled="!highlightedId"
            @click="confirmSelection"
          >
            Выбрать
          </button>

          <button
            type="button"
            class="cc3-checkout-address-book-modal__new"
            @click="$emit('newAddress')"
          >
            <Cc3Icon name="plus-md" :size="20" />
            Новый адрес доставки
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss">
.cc3-checkout-address-book-modal {
  position: fixed;
  inset: 0;
  z-index: 100;

  display: flex;
  align-items: flex-start;
  justify-content: center;

  padding: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-md);

  overflow-y: auto;

  &__overlay {
    position: fixed;
    inset: 0;

    background-color: rgb(16 24 40 / 55%);
  }

  &__dialog {
    position: relative;

    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-md);

    padding: var(--st-global-distance-space-inset-lg);
    width: 100%;
    max-width: 420px;

    background-color: var(--st-content-background-color-neutral-primary);
    border-radius: var(--st-global-radius-md);
    box-shadow: 0 20px 40px rgb(16 24 40 / 25%);
  }

  &__header {
    display: grid;
    align-items: center;
    grid-template-columns: 1fr auto 1fr;
  }

  &__title {
    grid-column: 2;
    margin: 0;

    @include font('label-lg');

    text-align: center;
  }

  &__close {
    display: flex;
    grid-column: 3;
    align-items: center;
    justify-content: center;
    justify-self: end;

    padding: 4px;

    color: var(--st-content-foreground-color-neutral-secondary);
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      color: var(--st-content-foreground-color-neutral-primary);
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);

    max-height: 55vh;

    overflow-y: auto;
  }

  &__empty {
    margin: 0;
    padding: var(--st-global-distance-space-inset-lg) 0;

    @include font('body-xs');

    color: var(--st-content-foreground-color-neutral-tetriary);
    text-align: center;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-stack-sm);
  }

  &__submit {
    padding: var(--st-global-distance-space-inset-md);
    width: 100%;

    font-family: inherit;

    @include font('label-md');

    color: #fff;
    background-color: var(--st-content-foreground-color-primary-secondary);
    border: none;
    border-radius: var(--st-global-radius-lg);
    cursor: pointer;

    &:disabled {
      color: var(--st-content-background-color-neutral-primary);
      background-color: var(--st-action-background-color-primary-subtle);
      cursor: not-allowed;
    }
  }

  // Обводка/цвета — те же, что у outline-кнопки Cc3CheckoutAddressTabs.
  &__new {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--st-global-distance-space-stack-sm);

    padding: var(--st-global-distance-space-inset-md);
    width: 100%;

    font-family: inherit;

    @include font('label-md');

    color: #091620;
    background-color: var(--st-content-background-color-neutral-primary);
    border: 1px solid #d2d7db;
    border-radius: var(--st-global-radius-lg);
    cursor: pointer;

    &:hover {
      border-color: #adbac4;
    }
  }
}
</style>
