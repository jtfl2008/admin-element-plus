/**
 * 工作台状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  WorkbenchData,
  LayoutConfig,
  LayoutItem,
} from '@/typings/workbench'

/**
 * 默认布局配置
 */
const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  items: [
    { id: 'data-cards', component: 'DataCards', x: 0, y: 0, w: 12, h: 2, visible: true, minW: 6, minH: 2 },
    { id: 'quick-actions', component: 'QuickActions', x: 0, y: 2, w: 12, h: 2, visible: true, minW: 6, minH: 2 },
    { id: 'charts', component: 'Charts', x: 0, y: 4, w: 8, h: 4, visible: true, minW: 6, minH: 3 },
    { id: 'activity', component: 'Activity', x: 8, y: 4, w: 4, h: 4, visible: true, minW: 3, minH: 3 },
  ],
  cols: { lg: 12, md: 10, sm: 6, xs: 4 },
  rowHeight: 60,
}

export const useWorkbenchStore = defineStore(
  'workbench',
  () => {
    // 状态
    const data = ref<WorkbenchData | null>(null)
    const layoutConfig = ref<LayoutConfig>({ ...DEFAULT_LAYOUT_CONFIG })
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const lastUpdate = ref<Date | null>(null)
    const autoRefresh = ref<boolean>(false)
    const refreshInterval = ref<number>(60000) // 默认 60 秒
    const refreshTimer = ref<number | null>(null)

    // Getters
    /**
     * 数据是否过期（超过 5 分钟）
     */
    const isDataStale = computed(() => {
      if (!lastUpdate.value) return true
      const now = new Date()
      const diff = now.getTime() - lastUpdate.value.getTime()
      return diff > 5 * 60 * 1000 // 5 分钟
    })

    /**
     * 可见的组件列表
     */
    const visibleComponents = computed(() => {
      return layoutConfig.value.items.filter((item) => item.visible)
    })

    /**
     * 是否有未读通知
     */
    const hasUnreadNotifications = computed(() => {
      if (!data.value?.notifications) return false
      return data.value.notifications.some((n) => !n.read)
    })

    /**
     * 未读通知数量
     */
    const unreadNotificationCount = computed(() => {
      if (!data.value?.notifications) return 0
      return data.value.notifications.filter((n) => !n.read).length
    })

    // Actions
    /**
     * 获取工作台数据
     */
    async function fetchData(): Promise<void> {
      loading.value = true
      error.value = null

      try {
        // 模拟 API 延迟
        await new Promise((resolve) => setTimeout(resolve, 800))

        // 使用模拟数据
        data.value = {
          statistics: {
            totalUsers: 1234,
            activeUsers: 567,
            totalOrders: 890,
            revenue: 123456.78,
          },
          trends: {
            userTrend: {
              current: 567,
              previous: 523,
              change: 44,
              changePercent: 8.4,
            },
            orderTrend: {
              current: 890,
              previous: 856,
              change: 34,
              changePercent: 4.0,
            },
            revenueTrend: {
              current: 123456.78,
              previous: 115234.56,
              change: 8222.22,
              changePercent: 7.1,
            },
          },
          activities: [
            {
              id: '1',
              type: 'create',
              content: '创建了新订单 #12345',
              user: '张三',
              timestamp: new Date(Date.now() - 5 * 60 * 1000),
            },
            {
              id: '2',
              type: 'update',
              content: '更新了用户信息',
              user: '李四',
              timestamp: new Date(Date.now() - 15 * 60 * 1000),
            },
            {
              id: '3',
              type: 'login',
              content: '登录系统',
              user: '王五',
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
            },
            {
              id: '4',
              type: 'delete',
              content: '删除了过期数据',
              user: '赵六',
              timestamp: new Date(Date.now() - 60 * 60 * 1000),
            },
            {
              id: '5',
              type: 'other',
              content: '导出了报表文件',
              user: '孙七',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
          ],
          notifications: [
            {
              id: '1',
              title: '系统更新通知',
              content: '系统将于今晚 22:00 进行维护,预计持续 2 小时',
              type: 'important',
              read: false,
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
            {
              id: '2',
              title: '新订单提醒',
              content: '您有 3 个新订单待处理,请及时查看',
              type: 'normal',
              read: false,
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            },
            {
              id: '3',
              title: '数据备份完成',
              content: '今日数据备份已完成,备份文件已保存',
              type: 'info',
              read: true,
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            },
            {
              id: '4',
              title: '权限变更通知',
              content: '您的账户权限已更新,请重新登录',
              type: 'important',
              read: true,
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          ],
        }

        lastUpdate.value = new Date()
      } catch (err) {
        error.value = err instanceof Error ? err.message : '获取数据失败'
        console.error('获取工作台数据失败:', err)
      } finally {
        loading.value = false
      }
    }

    /**
     * 刷新数据
     */
    async function refreshData(): Promise<void> {
      await fetchData()
    }

    /**
     * 更新布局配置
     */
    function updateLayoutConfig(config: LayoutConfig): void {
      layoutConfig.value = { ...config }
    }

    /**
     * 更新单个布局项
     */
    function updateLayoutItem(itemId: string, updates: Partial<LayoutItem>): void {
      const index = layoutConfig.value.items.findIndex((item) => item.id === itemId)
      if (index !== -1) {
        const currentItem = layoutConfig.value.items[index]
        layoutConfig.value.items[index] = {
          ...currentItem,
          ...updates,
        } as LayoutItem
      }
    }

    /**
     * 切换组件可见性
     */
    function toggleComponentVisibility(itemId: string): void {
      const item = layoutConfig.value.items.find((i) => i.id === itemId)
      if (item) {
        item.visible = !item.visible
      }
    }

    /**
     * 重置布局配置
     */
    function resetLayout(): void {
      layoutConfig.value = { ...DEFAULT_LAYOUT_CONFIG }
    }

    /**
     * 切换自动刷新
     */
    function toggleAutoRefresh(): void {
      autoRefresh.value = !autoRefresh.value

      if (autoRefresh.value) {
        startAutoRefresh()
      } else {
        stopAutoRefresh()
      }
    }

    /**
     * 设置刷新间隔
     */
    function setRefreshInterval(interval: number): void {
      refreshInterval.value = interval

      // 如果自动刷新已启动，重新启动以应用新间隔
      if (autoRefresh.value) {
        stopAutoRefresh()
        startAutoRefresh()
      }
    }

    /**
     * 启动自动刷新
     */
    function startAutoRefresh(): void {
      if (refreshTimer.value) {
        clearInterval(refreshTimer.value)
      }

      refreshTimer.value = window.setInterval(() => {
        refreshData()
      }, refreshInterval.value)
    }

    /**
     * 停止自动刷新
     */
    function stopAutoRefresh(): void {
      if (refreshTimer.value) {
        clearInterval(refreshTimer.value)
        refreshTimer.value = null
      }
    }

    /**
     * 标记通知为已读
     */
    async function markNotificationAsRead(notificationId: string): Promise<void> {
      // 更新本地状态
      if (data.value?.notifications) {
        const notification = data.value.notifications.find((n) => n.id === notificationId)
        if (notification) {
          notification.read = true
        }
      }
      
      // TODO: 等有接口后调用 API
      // try {
      //   await markNotificationReadApi(notificationId)
      // } catch (err) {
      //   console.error('标记通知已读失败:', err)
      // }
    }

    /**
     * 标记所有通知为已读
     */
    async function markAllNotificationsAsRead(): Promise<void> {
      // 更新本地状态
      if (data.value?.notifications) {
        data.value.notifications.forEach((n) => {
          n.read = true
        })
      }
      
      // TODO: 等有接口后调用 API
      // try {
      //   await markAllNotificationsReadApi()
      // } catch (err) {
      //   console.error('标记所有通知已读失败:', err)
      // }
    }

    /**
     * 清理资源（组件卸载时调用）
     */
    function cleanup(): void {
      stopAutoRefresh()
    }

    return {
      // 状态
      data,
      layoutConfig,
      loading,
      error,
      lastUpdate,
      autoRefresh,
      refreshInterval,
      // Getters
      isDataStale,
      visibleComponents,
      hasUnreadNotifications,
      unreadNotificationCount,
      // Actions
      fetchData,
      refreshData,
      updateLayoutConfig,
      updateLayoutItem,
      toggleComponentVisibility,
      resetLayout,
      toggleAutoRefresh,
      setRefreshInterval,
      startAutoRefresh,
      stopAutoRefresh,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      cleanup,
    }
  },
  {
    persist: {
      key: 'workbench-store',
      storage: localStorage,
    },
  }
)
