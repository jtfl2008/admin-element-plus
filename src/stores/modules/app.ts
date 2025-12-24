/**
 * 应用状态管理
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DeviceType, ThemeType } from '@/typings/global'

export const useAppStore = defineStore(
  'app',
  () => {
    // 状态
    const sidebarCollapsed = ref<boolean>(false)
    const device = ref<DeviceType>('desktop')
    const theme = ref<ThemeType>('light')

    // Actions
    /**
     * 切换侧边栏折叠状态
     */
    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    /**
     * 设置设备类型
     */
    function setDevice(deviceType: DeviceType) {
      device.value = deviceType
    }

    /**
     * 设置主题
     */
    function setTheme(themeType: ThemeType) {
      theme.value = themeType
      
      // 更新 HTML 根元素的 class
      if (themeType === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    return {
      // 状态
      sidebarCollapsed,
      device,
      theme,
      // Actions
      toggleSidebar,
      setDevice,
      setTheme,
    }
  },
  {
    persist: {
      key: 'app-store',
      storage: localStorage,
      paths: ['sidebarCollapsed', 'theme'],
    },
  }
)
