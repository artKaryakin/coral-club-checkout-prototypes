import { createApp } from 'vue'

import App from './App.vue'
import './styles/index.scss'

// ─── Слот для дизайн-системы ────────────────────────────────────────────────
// После установки приватного пакета UI:
//   import Ui from '<пакет-ui>'
//   app.use(Ui)
// ────────────────────────────────────────────────────────────────────────────

const app = createApp(App)

app.mount('#app')
