<script setup lang="ts">
import { useCheckout } from '@/composables/useCheckout'

import Cc3CheckoutPickupList from './Cc3CheckoutPickupList.vue'
import Cc3CheckoutPickupSelected from './Cc3CheckoutPickupSelected.vue'

const { selectedPickupPoint, clearPickupPoint } = useCheckout()
</script>

<template>
  <Cc3CheckoutPickupSelected
    v-if="selectedPickupPoint"
    :name="selectedPickupPoint.name"
    :address="selectedPickupPoint.address"
    :phone="selectedPickupPoint.phone"
    :note="selectedPickupPoint.note"
    @change="clearPickupPoint"
  />

  <Cc3CheckoutPickupList v-else />
</template>
