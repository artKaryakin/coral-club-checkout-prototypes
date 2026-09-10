<script setup lang="ts">
import { watch } from 'vue'
import Cc3PrototypeIndex from '@/components/Cc3PrototypeIndex.vue'
import Cc3Checkout from '@/components/Checkout/Cc3Checkout.vue'
import Cc3InlineCheckout from '@/components/Variants/Inline/Cc3InlineCheckout.vue'
import Cc3ModalCheckout from '@/components/Variants/Modal/Cc3ModalCheckout.vue'
import Cc3StandThankYou from '@/stand/components/Cc3StandThankYou.vue'
import { useStand } from '@/stand/composables/useStand'
import { useStandRun } from '@/stand/composables/useStandRun'

// Без варианта в адресе показываем список сценариев. С вариантом —
// свой корневой компонент на каждый прототип.
const { route, isModal, isInline } = useStand()

// Секундомер запускается здесь, а не внутри версии: замер должен начинаться
// в один и тот же момент во всех трёх, иначе времена несравнимы. Момент —
// открытие чекаута, то есть появление полного маршрута.
const { isFinished, beginRun, resetRun } = useStandRun()

watch(
  route,
  (value) => {
    // Ушли с чекаута — прохождение закрыто. Без этого экран благодарности
    // остаётся поверх всего: вход на стенд, журнал и следующий кейс
    // открывались бы с ним, пока его не сбросят руками.
    if (!value) {
      resetRun()

      return
    }

    beginRun(`${value.country}/${value.user}/${value.variant}`)
  },
  { immediate: true },
)
</script>

<template>
  <Cc3StandThankYou v-if="isFinished" />
  <Cc3ModalCheckout v-else-if="isModal" />
  <Cc3InlineCheckout v-else-if="isInline" />
  <Cc3Checkout v-else-if="route" />
  <Cc3PrototypeIndex v-else />
</template>
