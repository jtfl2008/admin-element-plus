<template>
  <div v-if="showTab" class="global-tab">
    <!-- 左侧滚动按钮 -->
    <button
      v-show="showScrollButton"
      class="tab-scroll-button left"
      @click="handleScrollLeft"
    >
      <el-icon><ArrowLeft /></el-icon>
    </button>

    <!-- 标签页列表 -->
    <div ref="tabListRef" class="tab-list" @wheel="handleWheel">
      <TabItem
        v-for="tab in tabList"
        :key="tab.key"
        :tab="tab"
        :active="tab.key === activeTab"
        @click="handleTabClick(tab)"
        @close="handleTabClose(tab)"
        @contextmenu="handleContextMenu($event, tab)"
        @dragstart="handleDragStart($event, tab)"
        @dragend="handleDragEnd"
        @dragover="handleDragOver($event, tab)"
        @drop="handleDrop($event, tab)"
      />
    </div>

    <!-- 右侧滚动按钮 -->
    <button
      v-show="showScrollButton"
      class="tab-scroll-button right"
      @click="handleScrollRight"
    >
      <el-icon><ArrowRight /></el-icon>
    </button>

    <!-- 右键菜单 -->
    <ContextMenu
      v-model:visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :tab="currentTab"
      @refresh="handleRefresh"
      @close="handleClose"
      @close-other="handleCloseOther"
      @close-left="handleCloseLeft"
      @close-right="handleCloseRight"
      @close-all="handleCloseAll"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/modules/app'
import { useTabStore } from '@/stores/modules/tab'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import TabItem from './components/tab-item.vue'
import ContextMenu from './components/context-menu.vue'
import type { TabItem as TabItemType } from '@/typings/layout'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const tabStore = useTabStore()

const tabListRef = ref<HTMLElement>()
const showScrollButton = ref(false)
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const currentTab = ref<TabItemType | null>(null)
const draggedTab = ref<TabItemType | null>(null)

const showTab = computed(() => appStore.layoutConfig.showTab)
const tabList = computed(() => tabStore.tabList)
const activeTab = computed(() => tabStore.activeTab)

/**
 * 监听路由变化，添加标签页
 */
watch(
  () => route.path,
  () => {
    if (route.meta?.title) {
      const tab: TabItemType = {
        key: route.path,
        label: route.meta.title as string,
        path: route.path,
        closable: !route.meta.affix,
        affix: route.meta.affix as boolean,
        query: route.query as Record<string, any>,
      }
      tabStore.addTab(tab)
      
      // 性能优化: 标签页数量超过 20 个时显示警告
      if (tabList.value.length > 20) {
        console.warn(`标签页数量过多 (${tabList.value.length}),可能影响性能,建议关闭一些不常用的标签页`)
      }
      
      // 滚动到激活的标签页
      nextTick(() => {
        scrollToActiveTab()
      })
    }
  },
  { immediate: true }
)

/**
 * 点击标签页
 */
function handleTabClick(tab: TabItemType) {
  if (tab.path !== route.path) {
    router.push({ path: tab.path, query: tab.query })
  }
}

/**
 * 关闭标签页
 */
function handleTabClose(tab: TabItemType) {
  if (!tab.closable) {
    return
  }

  tabStore.removeTab(tab.key)

  // 如果关闭的是当前标签页，跳转到新的激活标签页
  if (tab.key === route.path && tabStore.activeTab) {
    const activeTabItem = tabList.value.find((item) => item.key === tabStore.activeTab)
    if (activeTabItem) {
      router.push({ path: activeTabItem.path, query: activeTabItem.query })
    }
  }
}

/**
 * 右键菜单
 */
function handleContextMenu(e: MouseEvent, tab: TabItemType) {
  e.preventDefault()
  contextMenuX.value = e.clientX
  contextMenuY.value = e.clientY
  currentTab.value = tab
  contextMenuVisible.value = true
}

/**
 * 刷新标签页
 */
function handleRefresh() {
  if (currentTab.value) {
    // 重新加载当前路由
    router.replace({
      path: '/redirect' + currentTab.value.path,
      query: currentTab.value.query,
    })
  }
}

/**
 * 关闭标签页
 */
function handleClose() {
  if (currentTab.value) {
    handleTabClose(currentTab.value)
  }
}

/**
 * 关闭其他标签页
 */
function handleCloseOther() {
  if (currentTab.value) {
    tabStore.removeOtherTabs(currentTab.value.key)
    router.push({ path: currentTab.value.path, query: currentTab.value.query })
  }
}

/**
 * 关闭左侧标签页
 */
function handleCloseLeft() {
  if (currentTab.value) {
    tabStore.removeLeftTabs(currentTab.value.key)
  }
}

/**
 * 关闭右侧标签页
 */
function handleCloseRight() {
  if (currentTab.value) {
    tabStore.removeRightTabs(currentTab.value.key)
  }
}

/**
 * 关闭所有标签页
 */
function handleCloseAll() {
  tabStore.removeAllTabs()
  
  // 跳转到第一个固定标签页
  if (tabList.value.length > 0 && tabList.value[0]) {
    router.push({ path: tabList.value[0].path, query: tabList.value[0].query })
  }
}

/**
 * 滚动到激活的标签页
 */
function scrollToActiveTab() {
  if (!tabListRef.value) {
    return
  }

  const activeElement = tabListRef.value.querySelector('.tab-item.is-active') as HTMLElement
  if (activeElement) {
    activeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }
}

/**
 * 向左滚动
 */
function handleScrollLeft() {
  if (tabListRef.value) {
    tabListRef.value.scrollBy({
      left: -200,
      behavior: 'smooth',
    })
  }
}

/**
 * 向右滚动
 */
function handleScrollRight() {
  if (tabListRef.value) {
    tabListRef.value.scrollBy({
      left: 200,
      behavior: 'smooth',
    })
  }
}

/**
 * 鼠标滚轮滚动
 */
function handleWheel(e: WheelEvent) {
  if (tabListRef.value) {
    e.preventDefault()
    tabListRef.value.scrollBy({
      left: e.deltaY,
      behavior: 'auto',
    })
  }
}

/**
 * 开始拖拽
 */
function handleDragStart(e: DragEvent, tab: TabItemType) {
  draggedTab.value = tab
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

/**
 * 结束拖拽
 */
function handleDragEnd() {
  draggedTab.value = null
}

/**
 * 拖拽经过
 */
function handleDragOver(e: DragEvent, tab: TabItemType) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

/**
 * 放置
 */
function handleDrop(e: DragEvent, targetTab: TabItemType) {
  e.preventDefault()
  
  if (!draggedTab.value || draggedTab.value.key === targetTab.key) {
    return
  }

  const draggedIndex = tabList.value.findIndex((item) => item.key === draggedTab.value!.key)
  const targetIndex = tabList.value.findIndex((item) => item.key === targetTab.key)

  if (draggedIndex === -1 || targetIndex === -1) {
    return
  }

  // 创建新的标签页列表
  const newTabList = [...tabList.value]
  const removed = newTabList.splice(draggedIndex, 1)[0]
  if (removed) {
    newTabList.splice(targetIndex, 0, removed)
    // 更新标签页顺序
    tabStore.updateTabOrder(newTabList)
  }
}
</script>

<style scoped lang="scss">
.global-tab {
  display: flex;
  align-items: center;
  height: 48px;
  background-color: var(--color-bg-2, #ffffff);
  border-bottom: 1px solid var(--color-border, #e5e5e5);
  position: relative;
  padding: 0 var(--spacing-sm, 12px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.tab-scroll-button {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-duration, 0.3s);
  border-radius: var(--radius-sm, 4px);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--color-bg-1, #f5f5f5);
  }

  &:active {
    transform: scale(0.95);
  }

  &.left {
    margin-right: var(--spacing-xs, 8px);
  }

  &.right {
    margin-left: var(--spacing-xs, 8px);
  }

  .el-icon {
    font-size: 16px;
    color: var(--color-text-2, #666);
  }
}

.tab-list {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  padding: var(--spacing-xs, 8px) 0;

  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
}
</style>
