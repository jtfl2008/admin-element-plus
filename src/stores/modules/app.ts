/**
 * 应用状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ThemeType } from '@/typings/global'
import type { LayoutConfig, LayoutMode } from '@/typings/layout'

/**
 * 默认布局配置
 */
const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  layoutMode: 'vertical',
  sidebarCollapsed: false,
  sidebarWidth: 200,
  collapsedWidth: 64,
  showTab: true,
  showBreadcrumb: true,
  showFooter: false,
  fixedHeader: true,
  fixedSidebar: true,
  enableAnimation: true,
  minWidth: 1280,
  themeColor: '#1890ff',
}

export const useAppStore = defineStore(
  'app',
  () => {
    // 状态
    const sidebarCollapsed = ref<boolean>(false)
    const device = ref<'desktop'>('desktop')
    const theme = ref<ThemeType>('light')
    const layoutConfig = ref<LayoutConfig>({ ...DEFAULT_LAYOUT_CONFIG })
    const windowWidth = ref<number>(window.innerWidth)

    // Getters
    /**
     * 获取当前布局模式
     */
    const currentLayoutMode = computed(() => layoutConfig.value.layoutMode)

    /**
     * 是否显示侧边栏（水平布局不显示）
     */
    const showSider = computed(() => layoutConfig.value.layoutMode !== 'horizontal')

    /**
     * 窗口宽度是否小于最小宽度
     */
    const isBelowMinWidth = computed(() => windowWidth.value < layoutConfig.value.minWidth)

    // Actions
    /**
     * 切换侧边栏折叠状态
     */
    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
      layoutConfig.value.sidebarCollapsed = sidebarCollapsed.value
    }

    /**
     * 设置设备类型
     */
    function setDevice(deviceType: 'desktop') {
      device.value = deviceType
    }

    /**
     * 设置主题
     */
    function setTheme(themeType: ThemeType) {
      theme.value = themeType
      
      // 使用 data-theme 属性替代 class 方式
      // 添加过渡类以实现平滑切换
      document.documentElement.classList.add('theme-transitioning')
      
      if (themeType === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.setAttribute('data-theme', 'light')
        document.documentElement.classList.remove('dark')
      }
      
      // 300ms 后移除过渡类
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning')
      }, 300)
    }

    /**
     * 设置布局模式
     */
    function setLayoutMode(mode: LayoutMode) {
      layoutConfig.value.layoutMode = mode
    }

    /**
     * 更新布局配置
     */
    function updateLayoutConfig(config: Partial<LayoutConfig>) {
      layoutConfig.value = {
        ...layoutConfig.value,
        ...config,
      }
      
      // 同步侧边栏折叠状态
      if (config.sidebarCollapsed !== undefined) {
        sidebarCollapsed.value = config.sidebarCollapsed
      }
    }

    /**
     * 重置布局配置为默认值
     */
    function resetLayoutConfig() {
      layoutConfig.value = { ...DEFAULT_LAYOUT_CONFIG }
      sidebarCollapsed.value = DEFAULT_LAYOUT_CONFIG.sidebarCollapsed
    }

    /**
     * 获取布局配置
     */
    function getLayoutConfig(): LayoutConfig {
      return { ...layoutConfig.value }
    }

    /**
     * 更新窗口宽度
     */
    function updateWindowWidth(width: number) {
      windowWidth.value = width
      
      // 如果窗口宽度小于最小宽度，记录警告
      if (width < layoutConfig.value.minWidth) {
        console.warn(
          `窗口宽度 ${width}px 小于最小宽度 ${layoutConfig.value.minWidth}px，可能影响布局显示`
        )
      }
    }

    /**
     * 初始化窗口监听
     */
    function initWindowListener() {
      // 防抖函数
      let timeoutId: number | null = null
      const debounceDelay = 300

      const handleResize = () => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId)
        }
        
        timeoutId = window.setTimeout(() => {
          updateWindowWidth(window.innerWidth)
          timeoutId = null
        }, debounceDelay)
      }

      // 添加监听器
      window.addEventListener('resize', handleResize)

      // 初始化窗口宽度
      updateWindowWidth(window.innerWidth)

      // 返回清理函数
      return () => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId)
        }
        window.removeEventListener('resize', handleResize)
      }
    }

    return {
      // 状态
      sidebarCollapsed,
      device,
      theme,
      layoutConfig,
      windowWidth,
      // Getters
      currentLayoutMode,
      showSider,
      isBelowMinWidth,
      // Actions
      toggleSidebar,
      setDevice,
      setTheme,
      setLayoutMode,
      updateLayoutConfig,
      resetLayoutConfig,
      getLayoutConfig,
      updateWindowWidth,
      initWindowListener,
    }
  },
  {
    persist: {
      key: 'app-store',
      storage: localStorage,
    },
  }
)
