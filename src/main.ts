import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import 'primeflex/themes/primeone-light.css'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice'
import 'primeflex/primeflex.css'
import Material from '@primeuix/themes/material'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Ripple from 'primevue/ripple'
import './style.css'

const pinia = createPinia()
const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Material,
  },
})
app.use(ToastService)
app.directive('ripple', Ripple)
app.use(router)
app.use(pinia)
app.mount('#app')
