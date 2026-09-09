<script setup lang="ts">
import { useCheckout } from '@/composables/useCheckout'

// Хедер, сводка, оплата, итог заказа и подвал по макету пиксель-в-пиксель
// совпадают с модальным концептом — переиспользуем компоненты Cc3Modal*
// напрямую, а не копируем разметку под новым именем (см. CLAUDE.md —
// «любой повторяющийся код выносится в отдельный компонент»). Отличия
// инлайн-концепта — только в блоке доставки, он свой, Cc3Inline*.
import Cc3ModalFooter from '../Modal/Cc3ModalFooter.vue'
import Cc3ModalHeader from '../Modal/Cc3ModalHeader.vue'
import Cc3ModalOrderSummary from '../Modal/Cc3ModalOrderSummary.vue'
import Cc3ModalPaymentMethods from '../Modal/Cc3ModalPaymentMethods.vue'
import Cc3ModalSummaryBar from '../Modal/Cc3ModalSummaryBar.vue'
import Cc3InlineDeliverySection from './Cc3InlineDeliverySection.vue'

const { summary } = useCheckout()
</script>

<template>
  <div class="cc3-inline-checkout">
    <Cc3ModalHeader :cart-count="summary.itemsCount" />
    <Cc3ModalSummaryBar />

    <div class="cc3-inline-checkout__body">
      <Cc3InlineDeliverySection />
      <Cc3ModalPaymentMethods />
      <Cc3ModalOrderSummary />
      <Cc3ModalFooter />
    </div>
  </div>
</template>

<style lang="scss">
.cc3-inline-checkout {
  color-scheme: light;

  @include cc3-light-tokens;

  display: flex;
  flex-direction: column;

  margin: 0 auto;
  max-width: 375px;

  background-color: var(--st-content-background-color-default-solid-normal);

  &__body {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-md);

    padding-top: var(--st-global-distance-space-inset-2xl);

    // Серый разделитель между блоками, как в макете — у всех секций,
    // кроме первой (доставка идёт сразу за сводкой заказа, без линии).
    // Контейнер разделителя в фигме высотой 24px, а не просто линия
    // впритык — иначе она прилипает к заголовку следующего блока.
    > :not(:first-child) {
      border-top: 1px solid var(--st-content-border-color-neutral-implicit);
      padding-top: var(--st-global-distance-space-inset-2xl);
    }
  }
}
</style>
