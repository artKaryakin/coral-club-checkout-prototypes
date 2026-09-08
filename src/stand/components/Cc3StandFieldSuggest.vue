<template>
  <div class="cc3-stand-field-suggest">
    <ul v-if="items.length > 0" class="cc3-stand-field-suggest__list" role="listbox">
      <li v-for="(item, index) in items" :key="item.id" class="cc3-stand-field-suggest__item">
        <button
          type="button"
          class="cc3-stand-field-suggest__option"
          :class="{ 'cc3-stand-field-suggest__option--active': index === activeIndex }"
          role="option"
          :aria-selected="index === activeIndex"
          @mousedown.prevent="emit('pick', item)"
          @mouseenter="emit('hover', index)"
        >
          {{ item.label }}
        </button>
      </li>
    </ul>

    <p v-if="note" class="cc3-stand-field-suggest__note">{{ note }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AddressSuggestion, SuggestStatus } from '../suggest/types'
import { useStand } from '../composables/useStand'

/**
 * Выпадающий список подсказок — только отображение.
 *
 * Запрос, отмена и выбранная строка живут в поле: список не должен знать
 * ни про провайдера, ни про клавиатуру. Выбор мышью ловится на mousedown,
 * а не на click: click приходит после blur, поле к этому моменту уже
 * закрыло список и выбор терялся бы.
 */
const props = defineProps<{
  items: AddressSuggestion[]
  activeIndex: number
  status: SuggestStatus
}>()

const emit = defineEmits<{
  pick: [suggestion: AddressSuggestion]
  hover: [index: number]
}>()

const { t } = useStand()

const note = computed(() => {
  if (props.status === 'loading') return t('suggest.loading')
  if (props.status === 'empty') return t('suggest.empty')
  if (props.status === 'error') return t('suggest.error')

  return ''
})
</script>

<style lang="scss">
.cc3-stand-field-suggest {
  // Список — перекрытие над формой, а не элемент раскладки: иначе поля
  // ниже прыгают при каждом нажатии клавиши.
  position: absolute;
  inset-block-start: 100%;
  inset-inline: 0;
  z-index: 4;

  width: 100%;

  &__list {
    margin: 0;
    padding: 0;
    width: 100%;

    list-style: none;
    background-color: var(--st-content-background-color-neutral-primary);
    border-color: var(--st-action-border-color-neutral-subtle-normal);
    border-style: solid;
    border-width: 1px;
    border-radius: var(--st-global-radius-md);
    overflow: hidden;
  }

  &__option {
    display: block;

    padding: var(--st-global-distance-space-inset-md);
    width: 100%;

    text-align: start;
    color: var(--st-content-foreground-color-neutral-primary);
    background-color: transparent;
    border: none;
    cursor: pointer;

    &--active {
      background-color: var(--st-content-background-color-neutral-secondary);
    }
  }

  &__note {
    margin: var(--st-global-distance-space-inset-xs) 0 0;

    color: var(--st-content-foreground-color-neutral-tetriary);
  }
}
</style>
