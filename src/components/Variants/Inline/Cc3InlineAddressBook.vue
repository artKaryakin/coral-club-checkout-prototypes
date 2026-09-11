<script setup lang="ts">
import { computed } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useStand } from '@/stand/composables/useStand'

import type { DeliveryProfile } from '../Modal/deliveryProfile'

/**
 * Адресная книга инлайн-концепта по макету: один список карточек-радио
 * без поиска и без фильтра по способу — раскрывается в теле страницы,
 * без Teleport, без фиксированного позиционирования.
 */
const { t } = useStand()

const text = computed(() => ({
  title: t('addressBook.title'),
  close: t('common.close'),
  addAddress: t('delivery.addAddress'),
  edit: t('common.edit'),
}))

withDefaults(
  defineProps<{
    entries: DeliveryProfile[]
    selectedId?: string
    /**
     * Срок и цена доставки в карточке. В концепте inline-alt их нет у
     * курьерских карточек: способ доставки там выбирается после адреса,
     * отдельным блоком, и цена противоречила бы ещё не сделанному выбору.
     *
     * У пунктов выдачи цена остаётся всегда — отдельного блока для них нет,
     * а среди пунктов есть платные, и без цены их не отличить от бесплатных.
     */
    withPrice?: boolean
  }>(),
  { selectedId: undefined, withPrice: true },
)

const emit = defineEmits<{
  select: [id: string]
  edit: [id: string]
  add: []
  close: []
}>()
</script>

<template>
  <div class="cc3-inline-address-book">
    <div class="cc3-inline-address-book__header">
      <h2 class="cc3-inline-address-book__title">{{ text.title }}</h2>

      <button type="button" class="cc3-inline-address-book__close" @click="emit('close')">
        {{ text.close }}
      </button>
    </div>

    <div class="cc3-inline-address-book__list">
      <div class="cc3-inline-address-book__cards">
        <div v-for="entry in entries" :key="entry.id" class="cc3-inline-address-book__card">
          <label class="cc3-inline-address-book__card-select">
            <span class="cc3-inline-address-book__card-main">
              <span class="cc3-inline-address-book__card-type">{{ entry.typeLabel }}</span>

              <span class="cc3-inline-address-book__card-name">
                <Cc3Icon
                  name="heart"
                  :size="16"
                  class="cc3-inline-address-book__card-heart"
                  :class="{ 'cc3-inline-address-book__card-heart--active': entry.isFavorite }"
                />
                {{ entry.name }}
              </span>

              <span class="cc3-inline-address-book__card-address">{{ entry.addressLine }}</span>
              <span
                v-if="withPrice || entry.method === 'pickup'"
                class="cc3-inline-address-book__card-price"
              >
                {{ entry.priceLabel }}
              </span>
            </span>

            <input
              type="radio"
              name="cc3-inline-address-book"
              class="cc3-inline-address-book__radio"
              :checked="entry.id === selectedId"
              @change="emit('select', entry.id)"
            />
          </label>

          <button
            type="button"
            class="cc3-inline-address-book__card-edit"
            @click="emit('edit', entry.id)"
          >
            {{ text.edit }}
          </button>
        </div>
      </div>

      <button type="button" class="cc3-inline-address-book__add" @click="emit('add')">
        <Cc3Icon name="plus-md" :size="24" />
        {{ text.addAddress }}
      </button>
    </div>
  </div>
</template>

<style lang="scss">
.cc3-inline-address-book {
  padding: 0 var(--st-global-distance-space-inset-2xl);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: var(--st-global-distance-space-inset-sm) 0 var(--st-global-distance-space-inset-md);
  }

  &__title {
    margin: 0;

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__close {
    padding: var(--st-global-distance-space-inset-lg);

    @include font('label-sm');

    color: var(--st-action-foreground-color-positive-normal);
    background: none;
    border: none;
    cursor: pointer;
  }

  &__list {
    display: flex;
    flex-direction: column;

    background-color: var(--st-content-background-color-default-subtle-normal);
    border: 1px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-md);
    overflow: hidden;
  }

  &__cards {
    // Высота — примерно на 3 карточки: длиннее список не должен раздвигать
    // страницу, а должен прокручиваться сам. «Добавить адрес доставки» —
    // вне этого блока, поэтому остаётся на виду при любой прокрутке.
    max-height: 460px;

    overflow-y: auto;
  }

  &__card {
    display: flex;
    flex-direction: column;

    padding: 0 var(--st-global-distance-space-inset-2xl);
    width: 100%;

    // Граница снизу — у каждой карточки, включая последнюю (как в фигме):
    // список обрезан по высоте и прокручивается, поэтому «последняя видимая»
    // карточка не обязательно последняя в массиве — свой бордер у кнопки
    // «Добавить адрес» удвоил бы линию на границе обрезки.
    border-bottom: 1px solid var(--st-content-border-color-neutral-implicit);
  }

  // Отдельный label только вокруг радио и невзаимодействующего контента:
  // если сюда же попадёт кнопка «Изменить», label свяжется именно с ней
  // (первый в DOM labelable-потомок), а не с радио — клик по названию или
  // адресу станет открывать редактирование вместо выбора карточки.
  &__card-select {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-md);

    width: 100%;

    cursor: pointer;
  }

  &__card-main {
    display: flex;
    flex: 1;
    flex-direction: column;

    min-width: 0;
    padding: var(--st-global-distance-space-inset-sm) 0;
  }

  &__card-type {
    @include font('label-xs');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__card-name {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inline-xs);

    @include font('body-md');
    font-weight: 700;

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__card-heart {
    flex-shrink: 0;

    color: var(--st-content-foreground-color-neutral-tetriary);

    &--active {
      color: var(--st-content-foreground-color-positive-secondary);
    }
  }

  &__card-address {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__card-price {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__card-edit {
    padding: var(--st-global-distance-space-inset-xl) 0;
    width: 100%;

    text-align: left;

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
    background: none;
    border: none;
    cursor: pointer;
  }

  &__radio {
    flex-shrink: 0;

    @include cc3-modal-radio-control;
  }

  &__add {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: var(--st-global-distance-space-inline-sm);

    padding: var(--st-global-distance-space-inset-lg);
    width: 100%;
    height: 48px;

    @include font('label-md');

    color: var(--st-action-foreground-color-positive-normal);
    background: none;
    border: none;
    cursor: pointer;
  }
}
</style>
