<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { useSummarySticky } from '@/composables/useSummarySticky'
import { useStand } from '@/stand/composables/useStand'

import Cc3ModalOrderSummaryBody from './Cc3ModalOrderSummaryBody.vue'

/**
 * Блок сводки заказа в конце страницы.
 *
 * Пока он не доехал до верха, сумму несёт прилипшая шапка. Как только блок
 * поравнялся с ней, шапка отлипает и закрывается: две одинаковые сводки с
 * двумя «Итого» на одном экране — это вопрос «а какая настоящая» прямо
 * внутри замера.
 *
 * Момент передачи ловится меткой в начале блока: сам блок высокий, и по
 * нему не понять, доехал ли он до полосы или только показался снизу.
 */
const { t } = useStand()
const { trackSummaryAnchor } = useSummarySticky()

const text = computed(() => ({
  title: t('summary.title'),
}))

const anchorRef = ref<HTMLElement>()
let stopTracking: (() => void) | undefined

onMounted(() => {
  if (anchorRef.value) {
    stopTracking = trackSummaryAnchor(anchorRef.value)
  }
})

onBeforeUnmount(() => stopTracking?.())
</script>

<template>
  <section class="cc3-modal-order-summary">
    <span ref="anchorRef" class="cc3-modal-order-summary__anchor" aria-hidden="true" />

    <h2 class="cc3-modal-order-summary__title">{{ text.title }}</h2>

    <Cc3ModalOrderSummaryBody />
  </section>
</template>

<style lang="scss">
.cc3-modal-order-summary {
  // Метка момента передачи: по ней считается положение блока, человек её
  // не видит.
  &__anchor {
    display: block;

    height: 0;
  }

  &__title {
    margin: 0;
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl);

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }
}
</style>
