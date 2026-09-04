import type { Preview } from '@storybook/vue3'

// Глобальные токены и сброс — те же, что и в приложении.
import '../src/styles/index.scss'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
