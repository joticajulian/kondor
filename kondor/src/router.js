import Vue from 'vue'
import Router from 'vue-router'
import Welcome from './components/Welcome.vue'
import HelloWorld from './components/HelloWorld.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome
    },
    {
      path: '/hello',
      name: 'hello',
      component: HelloWorld
    },
  ]
})
