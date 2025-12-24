/**
 * Pinia Store 入口文件
 */

import type { App } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()

// 配置持久化插件
pinia.use(piniaPluginPersistedstate)

/**
 * 安装 Pinia
 */
export function setupStore(app: App) {
  app.use(pinia)
}

export default pinia
