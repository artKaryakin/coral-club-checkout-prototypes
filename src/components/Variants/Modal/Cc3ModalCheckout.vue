<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import { useCourierVariants } from '@/composables/useCourierVariants'
import { useStand } from '@/stand/composables/useStand'

import Cc3ModalDeliverySection from './Cc3ModalDeliverySection.vue'
import Cc3ModalFooter from './Cc3ModalFooter.vue'
import Cc3ModalHeader from './Cc3ModalHeader.vue'
import Cc3ModalOrderSummary from './Cc3ModalOrderSummary.vue'
import Cc3ModalPaymentMethods from './Cc3ModalPaymentMethods.vue'
import Cc3ModalSummaryBar from './Cc3ModalSummaryBar.vue'
import type { DeliveryProfile } from './deliveryProfile'
import Cc3InlineDeliveryOptions from '../Inline/Cc3InlineDeliveryOptions.vue'
import Cc3InlineDeliverySlots from '../Inline/Cc3InlineDeliverySlots.vue'

/**
 * Модальный концепт: адрес добавляется и правится в окне поверх чекаута.
 *
 * Срок и цена доставки выбираются в двух местах сразу. Отдельным блоком
 * в теле чекаута — так человек меняет доставку, не открывая окно адреса.
 * И внутри самого окна — потому что там он вводит адрес впервые, и уходить
 * за сроком на страницу под окном было бы странно. Выбор общий: поменяли
 * в одном месте — видно в другом.
 *
 * Разметка вариантов и слотов взята у инлайн-концепта, а не скопирована:
 * если цены разъедутся между версиями, сравнивать их станет нечестно.
 * Отличие концептов должно оставаться ровно одно — окно против страницы.
 */
const { summary } = useCheckout()
const { t } = useStand()
const { courierVariants, defaultVariantId } = useCourierVariants()

const text = computed(() => ({
  optionsTitle: t('delivery.variants'),
}))

const selectedEntry = ref<DeliveryProfile>()
const courierVariant = ref(defaultVariantId.value)

// Набор вариантов зависит от страны, и выбранного в новом наборе может не
// оказаться — тогда не выбрано ничего. Возвращаем выбор на первый.
watch(courierVariants, (list) => {
  if (!list.some((variant) => variant.id === courierVariant.value)) {
    courierVariant.value = defaultVariantId.value
  }
})


function onSelected(profile: DeliveryProfile | undefined) {
  selectedEntry.value = profile
}

/**
 * Блок вариантов показывается только у курьерской доставки и только когда
 * адрес уже выбран. У пункта выдачи выбирать нечего: цена и срок
 * принадлежат самому пункту и видны в его карточке.
 */
const isOptionsVisible = computed(() => selectedEntry.value?.method === 'courier')
</script>

<template>
  <div class="cc3-modal-checkout">
    <Cc3ModalHeader :cart-count="summary.itemsCount" />
    <Cc3ModalSummaryBar />

    <div class="cc3-modal-checkout__body">
      <Cc3ModalDeliverySection v-model:courier-variant="courierVariant" @selected="onSelected" />

      <section v-if="isOptionsVisible" class="cc3-modal-checkout__options">
        <h2 class="cc3-modal-checkout__options-title">{{ text.optionsTitle }}</h2>

        <Cc3InlineDeliveryOptions
          v-model="courierVariant"
          resolved
          name="modal-courier-variant"
        />

        <Cc3InlineDeliverySlots />
      </section>

      <Cc3ModalPaymentMethods />
      <Cc3ModalOrderSummary />
      <Cc3ModalFooter />
    </div>
  </div>
</template>

<style lang="scss">
.cc3-modal-checkout {
  // Этот прототип по макету только светлый (тёмного варианта в Figma
  // нет), в отличие от прода: color-scheme отвечает за нативные
  // radio/checkbox/select, а миксин переприменяет светлые значения
  // токенов ДС — на некоторых браузерах при системной тёмной теме
  // иначе темнеет и весь фон (токены реагируют на неё для прода).
  color-scheme: light;

  @include cc3-light-tokens;

  display: flex;
  flex-direction: column;

  margin: 0 auto;

  // Макет собран под 375px, но телефон бывает шире: на 390 по краям
  // оставалось по 8px фона, на 430 — по 28. Поэтому на телефоне блок
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

    // Серый разделитель между блоками, как в макете — у всех секций,
    // кроме первой (доставка идёт сразу за сводкой заказа, без линии).
    // Контейнер разделителя в фигме высотой 24px, а не просто линия
    // впритык — иначе она прилипает к заголовку следующего блока.
    > :not(:first-child) {
      border-top: 1px solid var(--st-content-border-color-neutral-implicit);
      padding-top: var(--st-global-distance-space-inset-2xl);
    }

    // Блоку доставки перед линией не хватало ровно 4px — остальным блокам
    // хватает отступа из gap выше.
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
