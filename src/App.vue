<script setup lang="ts">
import Cc3PrototypeIndex from '@/components/Cc3PrototypeIndex.vue'
import Cc3Checkout from '@/components/Checkout/Cc3Checkout.vue'
import { useVariant } from '@/composables/useVariant'

// Без варианта в адресе показываем список сценариев, иначе — сам чекаут.
const { route } = useVariant()
</script>

<template>
  <Cc3Checkout v-if="route" />
  <Cc3PrototypeIndex v-else />
</template>
