<script setup lang="ts">
import { computed, ref } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

// Хедер, сводка, оплата, итог заказа и подвал те же, что в остальных
// концептах — переиспользуем компоненты напрямую, а не копируем разметку
// под новым именем. Отличие этого концепта ровно одно, и оно ниже.
import Cc3InlineDeliveryOptions from '../Inline/Cc3InlineDeliveryOptions.vue'
import Cc3InlineDeliverySection from '../Inline/Cc3InlineDeliverySection.vue'
import Cc3ModalFooter from '../Modal/Cc3ModalFooter.vue'
import Cc3ModalHeader from '../Modal/Cc3ModalHeader.vue'
import Cc3ModalOrderSummary from '../Modal/Cc3ModalOrderSummary.vue'
import Cc3ModalPaymentMethods from '../Modal/Cc3ModalPaymentMethods.vue'
import Cc3ModalSummaryBar from '../Modal/Cc3ModalSummaryBar.vue'
import type { DeliveryProfile } from '../Modal/deliveryProfile'

/**
 * Инлайн-концепт, вариант B: способ доставки выбирается не внутри формы
 * адреса, а отдельным блоком в теле чекаута, после адреса.
 *
 * Что проверяем. В inline человек, добавляя адрес, одновременно выбирает
 * срок и цену — два решения в одной форме, и второе он принимает, ещё не
 * дописав первое. Здесь они разведены: сначала «куда», отдельным шагом
 * «как». Так устроено большинство американских чекаутов, и от этого
 * гипотеза: разведённые решения дают меньше возвратов в форму адреса.
 *
 * Из карточки адреса при этом убрана цена — она относится к выбору,
 * который ещё не сделан.
 */
const { summary } = useCheckout()
const { t } = useStand()

const text = computed(() => ({
  optionsTitle: t('delivery.variants'),
}))

const selectedEntry = ref<DeliveryProfile>()

function onSelected(profile: DeliveryProfile | undefined) {
  selectedEntry.value = profile
}

/**
 * Блок вариантов показывается только у курьерской доставки и только когда
 * адрес уже выбран. У пункта выдачи выбирать нечего: цена и срок
 * принадлежат самому пункту, они видны в его карточке.
 */
const isOptionsVisible = computed(() => selectedEntry.value?.method === 'courier')

const selectedCourierVariant = ref('standard')
</script>

<template>
  <div class="cc3-inline-alt-checkout">
    <Cc3ModalHeader :cart-count="summary.itemsCount" />
    <Cc3ModalSummaryBar />

    <div class="cc3-inline-alt-checkout__body">
      <Cc3InlineDeliverySection options-in-checkout @selected="onSelected" />

      <section v-if="isOptionsVisible" class="cc3-inline-alt-checkout__options">
        <h2 class="cc3-inline-alt-checkout__options-title">{{ text.optionsTitle }}</h2>

        <Cc3InlineDeliveryOptions
          v-model="selectedCourierVariant"
          resolved
          name="inline-alt-courier-variant"
        />
      </section>

      <Cc3ModalPaymentMethods />
      <Cc3ModalOrderSummary />
      <Cc3ModalFooter />
    </div>
  </div>
</template>

<style lang="scss">
.cc3-inline-alt-checkout {
  color-scheme: light;

  @include cc3-light-tokens;

  display: flex;
  flex-direction: column;

  margin: 0 auto;

  // Макет собран под 375px, но телефон бывает шире: на телефоне блок
  // тянется во всю ширину, а рамка в 375px остаётся только на десктопе,
  // где стенд смотрят как превью мобильного экрана.
  width: 100%;

  @include mediaMinWidth('sm') {
    max-width: 375px;
  }

  background-color: var(--st-content-background-color-default-solid-normal);

  &__body {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-2xl);

    padding-top: var(--st-global-distance-space-inset-2xl);

    // Серый разделитель между блоками, как в макете — у всех секций, кроме
    // первой: доставка идёт сразу за сводкой заказа, без линии.
    > :not(:first-child) {
      border-top: 1px solid var(--st-content-border-color-neutral-implicit);
      padding-top: var(--st-global-distance-space-inset-2xl);
    }

    > :first-child {
      padding-bottom: 4px;
    }
  }

  // Отступы по краям как у остальных блоков страницы: сами варианты
  // ничего не знают о том, куда их поставили.
  &__options {
    padding-right: var(--st-global-distance-space-inset-2xl);
    padding-left: var(--st-global-distance-space-inset-2xl);
  }

  &__options-title {
    margin: 0 0 var(--st-global-distance-space-inset-sm);

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }
}
</style>
