/**
 * 认证状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken as saveToken, removeToken as clearToken } from '@/utils/auth'
import { USER_INFO_KEY } from '@/constants'
import { localStorage } from '@/utils/storage'
import type { UserInfo, LoginParams } from '@/typings/api'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // 状态
    const token = ref<string>(getToken() || '')
    const userInfo = ref<UserInfo | null>(null)
    const permissions = ref<string[]>([])
    const roles = ref<string[]>([])

    // Getters
    const isLoggedIn = computed(() => !!token.value)

    const hasPermission = computed(() => {
      return (permission: string) => {
        return permissions.value.includes(permission)
      }
    })

    const hasRole = computed(() => {
      return (role: string) => {
        return roles.value.includes(role)
      }
    })

    // Actions
    /**
     * 登录
     */
    async function login(params: LoginParams) {
      try {
        // 这里需要调用登录 API
        // const response = await loginApi(params)
        // const { token: accessToken } = response
        
        // 临时模拟
        const accessToken = 'mock-token-' + Date.now()
        
        token.value = accessToken
        saveToken(accessToken)
        
        // 登录成功后获取用户信息
        await getUserInfo()
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    }

    /**
     * 登出
     */
    async function logout() {
      try {
        // 这里可以调用登出 API
        // await logoutApi()
        
        // 清除状态
        token.value = ''
        userInfo.value = null
        permissions.value = []
        roles.value = []
        
        // 清除本地存储
        clearToken()
        localStorage.removeItem(USER_INFO_KEY)
      } catch (error) {
        console.error('Logout failed:', error)
        throw error
      }
    }

    /**
     * 获取用户信息
     */
    async function getUserInfo() {
      try {
        // 这里需要调用获取用户信息 API
        // const response = await getUserInfoApi()
        
        // 临时模拟
        const mockUserInfo: UserInfo = {
          userId: 1,
          userName: 'admin',
          nickName: '管理员',
          email: 'admin@example.com',
          phonenumber: '13800138000',
          sex: '0',
          avatar: '',
          roles: ['admin'],
          permissions: ['*:*:*'],
        }
        
        userInfo.value = mockUserInfo
        roles.value = mockUserInfo.roles
        permissions.value = mockUserInfo.permissions
        
        // 保存用户信息到本地
        localStorage.setItem(USER_INFO_KEY, mockUserInfo)
      } catch (error) {
        console.error('Get user info failed:', error)
        throw error
      }
    }

    /**
     * 重置 Token
     */
    function resetToken() {
      token.value = ''
      clearToken()
    }

    /**
     * 更新用户信息
     */
    function updateUserInfo(info: Partial<UserInfo>) {
      if (userInfo.value) {
        Object.assign(userInfo.value, info)
        // 更新本地存储
        localStorage.setItem(USER_INFO_KEY, userInfo.value)
      }
    }

    /**
     * 更新用户头像
     */
    function updateAvatar(avatar: string) {
      if (userInfo.value) {
        userInfo.value.avatar = avatar
        // 更新本地存储
        localStorage.setItem(USER_INFO_KEY, userInfo.value)
      }
    }

    return {
      // 状态
      token,
      userInfo,
      permissions,
      roles,
      // Getters
      isLoggedIn,
      hasPermission,
      hasRole,
      // Actions
      login,
      logout,
      getUserInfo,
      resetToken,
      updateUserInfo,
      updateAvatar,
    }
  },
  {
    persist: {
      key: 'auth-store',
      storage: localStorage,
    },
  }
)
