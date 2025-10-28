import { createRouter, createWebHistory } from 'vue-router'
import RescueDashboard from '../views/RescueDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: RescueDashboard
    }
  ]
})

export default router