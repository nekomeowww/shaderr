import { MotionPlugin } from '@vueuse/motion'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

import App from './App.vue'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/themes.css'
import 'splitpanes/dist/splitpanes.css'

const router = createRouter({ history: createWebHashHistory(), routes })

createApp(App)
  .use(router)
  .use(MotionPlugin)
  .mount('#app')
