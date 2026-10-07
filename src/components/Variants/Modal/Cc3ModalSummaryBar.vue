<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'
import { useSummarySticky } from '@/composables/useSummarySticky'
import { useStand } from '@/stand/composables/useStand'

import Cc3ModalOrderSummaryBody from './Cc3ModalOrderSummaryBody.vue'

/**
 * Шапка сводки заказа над телом чекаута.
 *
 * Прилипает к верху экрана и несёт с собой итоговую сумму, пока в экран не
 * войдёт сам блок сводки внизу страницы. По нажатию раскрывается в полную
 * сводку — ту же самую, что и внизу.
 *
 * До этого кнопка переключала флаг, который в концептах никто не читал:
 * шеврон поворачивался, и больше ничего не происходило.
 */
const { t } = useStand()
const { summary } = useCheckout()
const { isExpanded, isSticky, toggle, resetSticky } = useSummarySticky()

const text = computed(() => ({
  title: t('summary.title'),
}))

onBeforeUnmount(resetSticky)
</script>

<template>
  <div
    class="cc3-modal-summary-bar"
    :class="{ 'cc3-modal-summary-bar--sticky': isSticky }"
  >
    <button type="button" class="cc3-modal-summary-bar__head" @click="toggle">
      <span class="cc3-modal-summary-bar__label">
        {{ text.title }}
        <Cc3Icon
          name="chevron-down"
          :size="24"
          class="cc3-modal-summary-bar__chevron"
          :class="{ 'cc3-modal-summary-bar__chevron--open': isExpanded }"
        />
      </span>

      <span class="cc3-modal-summary-bar__total">{{ summary.totalFormatRounded }}</span>
    </button>

    <!--
      Панель прокручивается сама, если не помещается в экран: на телефоне
      раскрытая сводка с миниатюрами и промокодом выше оставшейся высоты,
      и без этого до поля промокода не дотянуться.
    -->
    <div v-if="isExpanded" class="cc3-modal-summary-bar__panel">
      <Cc3ModalOrderSummaryBody />
    </div>
  </div>
</template>

<style lang="scss">
.cc3-modal-summary-bar {
  // Непрозрачная основа под полосой. Токен neutral-disable — полупрозрачный
  // налёт (8% синего), и в обычном потоке он лежал на белой странице. У
  // прилипшей полосы под ним едет содержимое страницы, и сквозь налёт было
  // видно поля формы.
  background-color: var(--st-content-background-color-default-solid-normal);

  &--sticky {
    position: sticky;
    top: 0;
    z-index: 5;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-xl);

    padding: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-2xl);
    width: 100%;

    text-align: left;
    background-color: var(--st-content-background-color-neutral-disable);
    border: none;
    cursor: pointer;
  }

  &__label {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-md);

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__chevron {
    transition: transform 0.15s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__total {
    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__panel {
    overflow-y: auto;
    max-height: calc(100dvh - 120px);

    background-color: var(--st-content-background-color-default-solid-normal);
    border-top: 1px solid var(--st-content-border-color-neutral-implicit);
    box-shadow: 0 8px 16px 0 rgb(4 51 103 / 11%);
  }
}
</style>
