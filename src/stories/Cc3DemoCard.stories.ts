import type { Meta, StoryObj } from '@storybook/vue3'

import Cc3DemoCard from '@/components/Cc3DemoCard.vue'

const meta = {
  title: 'App/Cc3DemoCard',
  component: Cc3DemoCard,
  tags: ['autodocs'],
  argTypes: {
    palette: {
      control: 'select',
      options: ['iris', 'indigo', 'coral'],
      description: 'Название цвета из ДС для палитры',
    },
  },
} satisfies Meta<typeof Cc3DemoCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Заголовок карточки',
    palette: 'iris',
  },
}
