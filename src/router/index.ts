import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import About from '../components/AboutComponent.vue'

const routes: RouteRecordRaw[] = [{ path: '/', redirect: '/aboutme' }]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
