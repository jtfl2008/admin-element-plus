/**
 * 权限相关 Hook
 */

import { computed } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'

/**
 * 使用权限 Hook
 */
export function useAuth() {
  const authStore = useAuthStore()

  /**
   * 检查是否有指定权限
   * @param permission 权限标识，如 'system:user:add'
   * @returns 是否有权限
   */
  const hasAuth = computed(() => {
    return (permission: string): boolean => {
      const permissions = authStore.permissions

      // 如果没有权限列表，返回 false
      if (!permissions || permissions.length === 0) {
        return false
      }

      // 如果有通配符权限 *:*:*，表示拥有所有权限
      if (permissions.includes('*:*:*')) {
        return true
      }

      // 检查是否包含指定权限
      return permissions.includes(permission)
    }
  })

  /**
   * 检查是否有指定角色
   * @param role 角色标识，如 'admin'
   * @returns 是否有角色
   */
  const hasRole = computed(() => {
    return (role: string): boolean => {
      const roles = authStore.roles

      // 如果没有角色列表，返回 false
      if (!roles || roles.length === 0) {
        return false
      }

      // 检查是否包含指定角色
      return roles.includes(role)
    }
  })

  /**
   * 检查是否有任意一个权限
   * @param permissions 权限标识数组
   * @returns 是否有任意一个权限
   */
  const hasAnyAuth = computed(() => {
    return (permissions: string[]): boolean => {
      return permissions.some(permission => hasAuth.value(permission))
    }
  })

  /**
   * 检查是否有所有权限
   * @param permissions 权限标识数组
   * @returns 是否有所有权限
   */
  const hasAllAuth = computed(() => {
    return (permissions: string[]): boolean => {
      return permissions.every(permission => hasAuth.value(permission))
    }
  })

  return {
    hasAuth,
    hasRole,
    hasAnyAuth,
    hasAllAuth
  }
}
