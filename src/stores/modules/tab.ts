/**
 * 标签页状态管理
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 标签页项
 */
export interface TabItem {
  path: string
  name: string
  title: string
  affix?: boolean // 是否固定（不可关闭）
}

export const useTabStore = defineStore(
  'tab',
  () => {
    // 状态
    const tabs = ref<TabItem[]>([])
    const activeTab = ref<string>('')

    // Actions
    /**
     * 添加标签页
     */
    function addTab(tab: TabItem) {
      // 检查标签页是否已存在
      const existingTab = tabs.value.find((item) => item.path === tab.path)
      
      if (existingTab) {
        // 如果已存在，只更新激活状态
        activeTab.value = tab.path
        return
      }

      // 添加新标签页
      tabs.value.push(tab)
      activeTab.value = tab.path
    }

    /**
     * 删除标签页
     */
    function removeTab(path: string) {
      const index = tabs.value.findIndex((item) => item.path === path)
      
      if (index === -1) {
        return
      }

      // 检查是否为固定标签页
      if (tabs.value[index].affix) {
        return
      }

      // 如果删除的是当前激活的标签页，需要激活相邻的标签页
      if (activeTab.value === path) {
        // 优先激活右侧标签页，如果没有则激活左侧
        const nextTab = tabs.value[index + 1] || tabs.value[index - 1]
        if (nextTab) {
          activeTab.value = nextTab.path
        }
      }

      // 删除标签页
      tabs.value.splice(index, 1)
    }

    /**
     * 删除其他标签页
     */
    function removeOtherTabs(path: string) {
      // 保留固定标签页和指定的标签页
      tabs.value = tabs.value.filter((item) => item.affix || item.path === path)
      activeTab.value = path
    }

    /**
     * 删除所有标签页
     */
    function removeAllTabs() {
      // 只保留固定标签页
      tabs.value = tabs.value.filter((item) => item.affix)
      
      // 如果有固定标签页，激活第一个
      if (tabs.value.length > 0) {
        activeTab.value = tabs.value[0].path
      } else {
        activeTab.value = ''
      }
    }

    /**
     * 设置激活的标签页
     */
    function setActiveTab(path: string) {
      activeTab.value = path
    }

    /**
     * 删除左侧标签页
     */
    function removeLeftTabs(path: string) {
      const index = tabs.value.findIndex((item) => item.path === path)
      if (index === -1) {
        return
      }

      // 保留固定标签页和指定路径右侧（包含）的标签页
      tabs.value = tabs.value.filter((item, i) => item.affix || i >= index)
    }

    /**
     * 删除右侧标签页
     */
    function removeRightTabs(path: string) {
      const index = tabs.value.findIndex((item) => item.path === path)
      if (index === -1) {
        return
      }

      // 保留固定标签页和指定路径左侧（包含）的标签页
      tabs.value = tabs.value.filter((item, i) => item.affix || i <= index)
    }

    return {
      // 状态
      tabs,
      activeTab,
      // Actions
      addTab,
      removeTab,
      removeOtherTabs,
      removeAllTabs,
      setActiveTab,
      removeLeftTabs,
      removeRightTabs,
    }
  },
  {
    persist: {
      key: 'tab-store',
      storage: localStorage,
      paths: ['tabs', 'activeTab'],
    },
  }
)
