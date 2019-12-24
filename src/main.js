import Vue from 'vue'
import App from './App.vue'
import plugins from '@/plugins'
import router from '@/router'
import store from '@/store'

Vue.config.productionTip = false

new Vue({
  plugins,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
