import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '@/components/pages/Index'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Index, name: 'index' }
  ]
})
