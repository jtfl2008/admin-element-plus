/**
 * 路由状态管理
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteConfig } from '@/typings/router'

export const useRouteStore = defineStore('route', () => {
  // 状态
  const routes = ref<RouteConfig[]>([])
  const menuList = ref<RouteConfig[]>([])
  const isRoutesLoaded = ref<boolean>(false)

  // Actions
  /**
   * 设置路由
   */
  function setRoutes(newRoutes: RouteConfig[]) {
    routes.value = newRoutes
    menuList.value = filterMenuList(newRoutes)
    // 注意：isRoutesLoaded 应该在路由守卫中设置，而不是在这里
  }

  /**
   * 根据权限生成路由
   */
  async function generateRoutes(permissions: string[]): Promise<RouteConfig[]> {
    try {
      // 这里需要从后端获取路由配置或从本地路由配置中过滤
      // 临时方案：从路由配置文件导入异步路由
      const { asyncRoutes } = await import('@/router/routes')
      
      // 根据权限过滤路由
      const accessedRoutes = filterRoutesByPermissions(asyncRoutes as RouteConfig[], permissions)
      
      setRoutes(accessedRoutes)
      return accessedRoutes
    } catch (error) {
      console.error('Generate routes failed:', error)
      // 即使失败也要设置空数组，避免菜单组件出错
      setRoutes([])
      return []
    }
  }

  /**
   * 重置路由
   */
  function resetRoutes() {
    routes.value = []
    menuList.value = []
    isRoutesLoaded.value = false
  }

  /**
   * 根据权限过滤路由
   */
  function filterRoutesByPermissions(
    routes: RouteConfig[],
    permissions: string[]
  ): RouteConfig[] {
    const result: RouteConfig[] = []

    routes.forEach((route) => {
      const tmp = { ...route }

      // 检查权限
      if (hasPermission(tmp, permissions)) {
        // 递归过滤子路由
        if (tmp.children) {
          tmp.children = filterRoutesByPermissions(tmp.children, permissions)
        }
        result.push(tmp)
      }
    })

    return result
  }

  /**
   * 检查是否有权限访问路由
   */
  function hasPermission(route: RouteConfig, permissions: string[]): boolean {
    // 如果路由没有设置权限要求，则默认可以访问
    if (!route.meta?.permissions || route.meta.permissions.length === 0) {
      return true
    }

    // 如果用户有超级管理员权限
    if (permissions.includes('*:*:*')) {
      return true
    }

    // 检查用户是否有路由要求的任一权限
    return route.meta.permissions.some((permission) => permissions.includes(permission))
  }

  /**
   * 过滤菜单列表（隐藏不需要在菜单中显示的路由）
   */
  function filterMenuList(routes: RouteConfig[]): RouteConfig[] {
    const result: RouteConfig[] = []

    routes.forEach((route) => {
      // 跳过隐藏的路由
      if (route.meta?.hidden) {
        return
      }

      // 创建新对象，避免修改原对象
      const tmp = { ...route }

      // 递归过滤子路由
      if (tmp.children && tmp.children.length > 0) {
        tmp.children = filterMenuList(tmp.children)
      }

      result.push(tmp)
    })

    return result
  }

  return {
    // 状态
    routes,
    menuList,
    isRoutesLoaded,
    // Actions
    setRoutes,
    generateRoutes,
    resetRoutes,
  }
})
