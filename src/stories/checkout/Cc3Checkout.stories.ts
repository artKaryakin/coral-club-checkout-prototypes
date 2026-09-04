import type { Meta, StoryObj } from '@storybook/vue3'

import Cc3Checkout from '@/components/Checkout/Cc3Checkout.vue'
import { resetCheckout, type DeliveryMethod } from '@/composables/useCheckout'

const meta = {
  title: 'App/Checkout/Cc3Checkout',
  component: Cc3Checkout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Cc3Checkout>

export default meta

type Story = StoryObj<typeof meta>

// Состояние чекаута общее на модуль, поэтому каждая стори выставляет своё.
const scenario = (method: DeliveryMethod, pickupPointId?: string) => () => ({
  components: { Cc3Checkout },
  setup() {
    resetCheckout(method, pickupPointId)
  },
  template: '<Cc3Checkout />',
})

export const Courier: Story = {
  name: 'Доставка курьером',
  render: scenario('courier'),
}

export const Pickup: Story = {
  name: 'Самовывоз — выбор пункта',
  render: scenario('pickup'),
}

export const PickupSelected: Story = {
  name: 'Самовывоз — пункт выбран',
  render: scenario('pickup', 'office-horoshevskoe'),
}
