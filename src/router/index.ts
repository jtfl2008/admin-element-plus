/**
 * Vue Router 实例
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { App } from 'vue'
import { constantRoutes } from './routes'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

/**
 * 安装路由
 */
export function setupRouter(app: App) {
  app.use(router)
}

export default router
