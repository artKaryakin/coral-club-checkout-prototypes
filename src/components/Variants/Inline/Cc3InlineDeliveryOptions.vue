<script setup lang="ts">
import { computed } from 'vue'

import { useCourierVariants } from '@/composables/useCourierVariants'
import { useStand } from '@/stand/composables/useStand'

/**
 * Список вариантов курьерской доставки.
 *
 * Вынесен из формы адреса отдельным компонентом, потому что показывается в
 * двух местах: внутри формы (концепт inline) и отдельным блоком в теле
 * чекаута (концепт inline-alt). Разметка одна на оба места — иначе они
 * начнут расходиться, и разница между концептами станет случайной, а не
 * спроектированной.
 *
 * Заголовок рисует не этот компонент, а тот, кто его ставит: в форме он
 * идёт наравне с другими подзаголовками формы, в чекауте — как заголовок
 * самостоятельного блока.
 */
const { t, country } = useStand()
const { courierVariants } = useCourierVariants()

const selected = defineModel<string>({ default: 'standard' })

const props = defineProps<{
  /** Адрес ещё не определён — вместо цен показываем плашку-подсказку. */
  resolved?: boolean
  /** Имя группы радио: на странице их может быть несколько. */
  name?: string
}>()

const text = computed(() => ({
  hint: t('delivery.variants.hint'),
}))

const groupName = computed(() => props.name ?? 'cc3-inline-delivery-options')

/**
 * На рынке США варианты показываются карточками, а выбранный обведён рамкой —
 * так устроены чекауты, на которых вырос тамошний покупатель. На остальных
 * рынках остаётся строка с радио-кнопкой, как в макете.
 */
const isCards = computed(() => country.value === 'us')
</script>

<template>
  <div
    v-if="resolved"
    class="cc3-inline-delivery-options"
    :class="{ 'cc3-inline-delivery-options--cards': isCards }"
  >
    <label
      v-for="variant in courierVariants"
      :key="variant.id"
      class="cc3-inline-delivery-options__cell"
      :class="{ 'cc3-inline-delivery-options__cell--selected': selected === variant.id }"
    >
      <span class="cc3-inline-delivery-options__content">
        <span class="cc3-inline-delivery-options__title">{{ variant.title }}</span>
        <span v-if="variant.caption" class="cc3-inline-delivery-options__caption">
          {{ variant.caption }}
        </span>
      </span>
      <input
        v-model="selected"
        type="radio"
        :name="groupName"
        :value="variant.id"
        class="cc3-inline-delivery-options__radio"
      />
    </label>
  </div>

  <p v-else class="cc3-inline-delivery-options__hint">{{ text.hint }}</p>
</template>

<style lang="scss">
.cc3-inline-delivery-options {
  display: flex;
  flex-direction: column;

  // Карточный вид: выбор показывает рамка, радио остаётся ради клавиатуры
  // и скринридеров, но не рисуется.
  &--cards {
    gap: var(--st-global-distance-space-inset-md);

    .cc3-inline-delivery-options__cell {
      padding: var(--st-global-distance-space-inset-xl);

      border: 1px solid var(--st-content-border-color-neutral-implicit);
      border-radius: var(--st-global-radius-lg);
    }

    .cc3-inline-delivery-options__cell--selected {
      border-color: var(--st-content-foreground-color-neutral-primary);
      box-shadow: inset 0 0 0 1px var(--st-content-foreground-color-neutral-primary);
    }

    .cc3-inline-delivery-options__cell:focus-within {
      outline: 2px solid var(--st-action-foreground-color-positive-normal);
      outline-offset: 2px;
    }

    .cc3-inline-delivery-options__radio {
      position: absolute;

      width: 1px;
      height: 1px;

      opacity: 0;
      pointer-events: none;
    }
  }

  &__cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-xl);

    padding: var(--st-global-distance-space-inset-md) 0;

    cursor: pointer;
  }

  &__content {
    display: flex;
    flex-direction: column;
  }

  &__title {
    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__caption {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__radio {
    @include cc3-modal-radio-control;
  }

  &__hint {
    margin: 0;
    padding: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-3xl);

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-tetriary);
    background-color: var(--st-content-background-color-neutral-subtle);
    border-radius: var(--st-global-radius-lg);
  }
}
</style>
