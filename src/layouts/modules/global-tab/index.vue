<template>
  <div v-if="showTab" class="global-tab" :class="`theme-${currentTabTheme}`">
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
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/modules/app'
import { useTabStore } from '@/stores/modules/tab'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import TabItem from './components/tab-item.vue'
import ContextMenu from './components/context-menu.vue'
import type { TabItem as TabItemType } from '@/typings/layout'
import { getThemeConfig, type TabThemeType, type TabThemeConfig } from './config/tab-themes'

/**
 * 组件 Props
 */
interface Props {
  /**
   * 主题类型
   * @default 'card'
   * @example
   * ```vue
   * <GlobalTab theme="button" />
   * ```
   */
  theme?: TabThemeType
  
  /**
   * 自定义主题配置
   * 用于覆盖默认主题的部分或全部样式
   * @example
   * ```vue
   * <GlobalTab 
   *   theme="card"
   *   :theme-config="{
   *     light: {
   *       activeBg: '#ff0000',
   *       activeText: '#ffffff'
   *     }
   *   }"
   * />
   * ```
   */
  themeConfig?: Partial<TabThemeConfig>
}

const props = withDefaults(defineProps<Props>(), {
  theme: undefined,
  themeConfig: undefined
})

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
 * 当前标签页主题（优先使用 appStore 配置，props 可以覆盖）
 */
const currentTabTheme = computed(() => {
  // 如果 props.theme 明确传递了值，使用 props.theme
  // 否则使用 appStore 的配置，最后回退到 'card'
  const theme = props.theme || appStore.layoutConfig.tabTheme || 'card'
  console.log('[GlobalTab] 当前主题:', theme, {
    propsTheme: props.theme,
    storeTheme: appStore.layoutConfig.tabTheme
  })
  return theme
})

/**
 * 计算当前主题配置
 */
const currentThemeConfig = computed(() => {
  return getThemeConfig(currentTabTheme.value, props.themeConfig)
})

/**
 * 检测当前是否为深色模式
 * TODO: 根据实际项目的深色模式实现方式调整
 */
const isDarkMode = computed(() => {
  // 从 appStore 获取深色模式状态
  // 如果项目中没有深色模式，可以暂时返回 false
  return false
})

/**
 * 获取当前模式的主题颜色
 */
const currentColors = computed(() => {
  return isDarkMode.value 
    ? currentThemeConfig.value.dark 
    : currentThemeConfig.value.light
})

/**
 * 应用主题样式
 * 通过更新 CSS 变量来动态切换主题
 */
function applyTheme() {
  try {
    const colors = currentColors.value
    const root = document.documentElement
    
    console.log('[GlobalTab] 应用主题:', currentTabTheme.value, colors)
    
    // 批量更新 CSS 变量
    root.style.setProperty('--tab-theme-bg', colors.tabBg)
    root.style.setProperty('--tab-theme-text', colors.tabText)
    root.style.setProperty('--tab-theme-border', colors.tabBorder)
    root.style.setProperty('--tab-theme-active-bg', colors.activeBg)
    root.style.setProperty('--tab-theme-active-text', colors.activeText)
    root.style.setProperty('--tab-theme-active-border', colors.activeBorder)
    root.style.setProperty('--tab-theme-hover-bg', colors.hoverBg)
    root.style.setProperty('--tab-theme-hover-text', colors.hoverText)
    root.style.setProperty('--tab-theme-hover-border', colors.hoverBorder)
    root.style.setProperty('--tab-theme-border-radius', colors.borderRadius)
    root.style.setProperty('--tab-theme-padding', colors.padding)
    root.style.setProperty('--tab-theme-gap', colors.gap)
    root.style.setProperty('--tab-theme-shadow', colors.shadow || 'none')
    
    // 下划线主题专用变量
    if (colors.underlineColor) {
      root.style.setProperty('--tab-theme-underline-color', colors.underlineColor)
    }
    if (colors.underlineHeight) {
      root.style.setProperty('--tab-theme-underline-height', colors.underlineHeight)
    }
  } catch (error) {
    console.error('应用主题失败:', error)
  }
}

/**
 * 监听主题颜色变化
 */
watch(currentColors, () => {
  applyTheme()
}, { immediate: true })

/**
 * 组件挂载时应用主题
 */
onMounted(() => {
  applyTheme()
})

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
@import './styles/index.scss';

.global-tab {
  display: flex;
  align-items: center;
  height: 60px;
  background-color: var(--color-bg-2, #ffffff);
  border-bottom: 1px solid var(--color-border, #e5e5e5);
  position: relative;
  padding: 0 var(--spacing-sm, 12px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  flex-shrink: 0; /* 防止在 flex 布局中被压缩 */
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
