import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'leaflet/dist/leaflet.css'
import './assets/style.css'
import { observeMapLanguage } from './utils/mapLanguage.js'

const app = createApp(App)
app.use(router)
app.mount('#app')
observeMapLanguage(document.querySelector('#app'))
