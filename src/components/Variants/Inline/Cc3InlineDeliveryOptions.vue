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
const { t } = useStand()
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
</script>

<template>
  <div v-if="resolved" class="cc3-inline-delivery-options">
    <label
      v-for="variant in courierVariants"
      :key="variant.id"
      class="cc3-inline-delivery-options__cell"
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
