<script setup lang="ts">
import Cc3PrototypeIndex from '@/components/Cc3PrototypeIndex.vue'
import Cc3Checkout from '@/components/Checkout/Cc3Checkout.vue'
import Cc3ModalCheckout from '@/components/Variants/Modal/Cc3ModalCheckout.vue'
import { useStand } from '@/stand/composables/useStand'

// Без варианта в адресе показываем список сценариев. С вариантом —
// свой корневой компонент на каждый прототип (inline пока не готов,
// временно показывает прод-версию).
const { route, isModal } = useStand()
</script>

<template>
  <Cc3ModalCheckout v-if="isModal" />
  <Cc3Checkout v-else-if="route" />
  <Cc3PrototypeIndex v-else />
</template>
