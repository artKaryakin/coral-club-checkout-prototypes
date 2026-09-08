import { createApp } from 'vue'

import App from './App.vue'
import { lockPageZoom } from './utils/lockPageZoom'
import './styles/index.scss'

// ─── Слот для дизайн-системы ────────────────────────────────────────────────
// После установки приватного пакета UI:
//   import Ui from '<пакет-ui>'
//   app.use(Ui)
// ────────────────────────────────────────────────────────────────────────────

lockPageZoom()

const app = createApp(App)

app.mount('#app')
