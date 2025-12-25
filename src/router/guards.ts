/**
 * 路由守卫
 */

import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'
import { useRouteStore } from '@/stores/modules/route'
import { useTabStore } from '@/stores/modules/tab'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置 NProgress
NProgress.configure({ showSpinner: false })

// 白名单路由（不需要登录即可访问）
const whiteList = ['/login', '/404', '/403']

/**
 * 设置路由守卫
 */
export function setupRouterGuards(router: Router) {
  // 全局前置守卫
  router.beforeEach(async (to, _from, next) => {
    // 显示加载进度条
    NProgress.start()

    const authStore = useAuthStore()
    const routeStore = useRouteStore()
    const tabStore = useTabStore()

    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 管理系统` : '管理系统'

    // 检查用户是否已登录
    if (authStore.isLoggedIn) {
      if (to.path === '/login') {
        // 已登录，跳转到首页
        next({ path: '/' })
        NProgress.done()
      } else {
        // 检查是否已加载动态路由
        if (!routeStore.isRoutesLoaded) {
          try {
            // 获取用户信息（如果还没有）
            if (!authStore.userInfo) {
              await authStore.getUserInfo()
            }

            // 根据用户权限生成动态路由
            const accessRoutes = await routeStore.generateRoutes(authStore.permissions)

            // 动态添加路由
            accessRoutes.forEach((route) => {
              router.addRoute(route as any)
            })

            // 标记路由已加载（在添加路由后立即标记，避免重复加载）
            routeStore.isRoutesLoaded = true

            // 重新导航到目标路由
            next({ ...to, replace: true })
            return
          } catch (error) {
            // 获取用户信息失败，清除 token 并跳转到登录页
            console.error('Failed to get user info:', error)
            authStore.resetToken()
            next(`/login?redirect=${to.path}`)
            NProgress.done()
            return
          }
        }

        // 检查路由是否需要认证
        if (to.meta.requiresAuth !== false) {
          // 检查用户是否有权限访问该路由
          if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
            const hasPermission = to.meta.permissions.some((permission) =>
              authStore.hasPermission(permission as string)
            )

            if (!hasPermission) {
              // 无权限，跳转到 403 页面
              next('/403')
              NProgress.done()
              return
            }
          }
        }

        // 添加标签页
        if (to.meta.title && !to.meta.hidden) {
          tabStore.addTab({
            key: to.path,
            label: to.meta.title as string,
            path: to.path,
            closable: !to.meta.affix,
            affix: to.meta.affix as boolean,
          })
        }

        next()
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path)) {
        // 在白名单中，直接访问
        next()
      } else {
        // 不在白名单中，重定向到登录页
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  })

  // 全局后置守卫
  router.afterEach(() => {
    // 隐藏加载进度条
    NProgress.done()
  })

  // 全局错误处理
  router.onError((error) => {
    console.error('Router error:', error)
    NProgress.done()
  })
}
