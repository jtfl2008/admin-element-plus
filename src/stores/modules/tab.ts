/**
 * 标签页状态管理
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TabItem } from '@/typings/layout'

export const useTabStore = defineStore(
  'tab',
  () => {
    // 状态
    const tabList = ref<TabItem[]>([])
    const activeTab = ref<string>('')

    // Actions
    /**
     * 添加标签页
     */
    function addTab(tab: TabItem) {
      // 检查标签页是否已存在
      const existIndex = tabList.value.findIndex((item) => item.key === tab.key)
      
      if (existIndex === -1) {
        // 不存在则添加
        tabList.value.push(tab)
      } else {
        // 存在则更新
        tabList.value[existIndex] = tab
      }
      
      // 设置为激活标签页
      activeTab.value = tab.key
    }

    /**
     * 删除标签页
     */
    function removeTab(key: string) {
      const index = tabList.value.findIndex((item) => item.key === key)
      
      if (index === -1) {
        return
      }

      // 如果删除的是当前激活的标签页，需要激活相邻的标签页
      if (activeTab.value === key) {
        // 优先激活右侧标签页，如果没有则激活左侧
        const nextTab = tabList.value[index + 1] || tabList.value[index - 1]
        if (nextTab) {
          activeTab.value = nextTab.key
        }
      }

      tabList.value.splice(index, 1)
    }

    /**
     * 删除其他标签页
     */
    function removeOtherTabs(key: string) {
      tabList.value = tabList.value.filter((item) => item.key === key || item.affix)
      activeTab.value = key
    }

    /**
     * 删除左侧标签页
     */
    function removeLeftTabs(key: string) {
      const index = tabList.value.findIndex((item) => item.key === key)
      if (index === -1) {
        return
      }

      tabList.value = tabList.value.filter((item, i) => i >= index || item.affix)
    }

    /**
     * 删除右侧标签页
     */
    function removeRightTabs(key: string) {
      const index = tabList.value.findIndex((item) => item.key === key)
      if (index === -1) {
        return
      }

      tabList.value = tabList.value.filter((item, i) => i <= index || item.affix)
    }

    /**
     * 删除所有标签页（保留固定标签页）
     */
    function removeAllTabs() {
      tabList.value = tabList.value.filter((item) => item.affix)
      
      // 如果还有固定标签页，激活第一个
      if (tabList.value.length > 0 && tabList.value[0]) {
        activeTab.value = tabList.value[0].key
      }
    }

    /**
     * 设置激活的标签页
     */
    function setActiveTab(key: string) {
      activeTab.value = key
    }

    /**
     * 更新标签页顺序
     */
    function updateTabOrder(tabs: TabItem[]) {
      tabList.value = tabs
    }

    /**
     * 刷新标签页
     */
    function refreshTab(key: string) {
      // 这个方法需要配合路由刷新实现
      // 可以通过重新加载组件或重定向来实现
      console.log('刷新标签页:', key)
    }

    /**
     * 初始化固定标签页
     */
    function initAffixTabs(tabs: TabItem[]) {
      tabs.forEach((tab) => {
        if (tab.affix && !tabList.value.find((item) => item.key === tab.key)) {
          tabList.value.push(tab)
        }
      })
    }

    return {
      // 状态
      tabList,
      activeTab,
      // Actions
      addTab,
      removeTab,
      removeOtherTabs,
      removeLeftTabs,
      removeRightTabs,
      removeAllTabs,
      setActiveTab,
      updateTabOrder,
      refreshTab,
      initAffixTabs,
    }
  },
  {
    persist: {
      key: 'tab-store',
      storage: localStorage,
    },
  }
)
