/**
 * 应用入口文件
 */

import './assets/main.css'
import 'nprogress/nprogress.css'

import { createApp } from 'vue'
import App from './App.vue'

// 导入 Store 和 Router
import { setupStore } from './stores'
import { setupRouter } from './router'
import router from './router'
import { setupRouterGuards } from './router/guards'

// 创建应用实例
const app = createApp(App)

// 配置 Store
setupStore(app)

// 配置 Router
setupRouter(app)

// 配置路由守卫
setupRouterGuards(router)

// 挂载应用
app.mount('#app')
