<template>
  <div class="layout-default">
    <!-- 侧边栏 -->
    <GlobalSider
      :collapsed="sidebarCollapsed"
      :width="layoutConfig.sidebarWidth"
      :collapsed-width="layoutConfig.collapsedWidth"
      :fixed="layoutConfig.fixedSidebar"
    />

    <!-- 主内容区 -->
    <div class="layout-container" :style="containerStyle">
      <!-- 头部 -->
      <GlobalHeader :fixed="false">
        <template #left>
          <CollapseButton v-show="showSider" />
          <GlobalBreadcrumb v-show="layoutConfig.showBreadcrumb" />
        </template>
        <template #right>
          <Search />
          <Fullscreen />
          <ThemeButton />
          <ThemeDrawerButton @click="themeDrawerVisible = true" />
          <Notice />
          <UserCenter />
        </template>
      </GlobalHeader>

      <!-- 主体内容 -->
      <main class="layout-main">
        <!-- 标签页 -->
        <GlobalTab />

        <!-- 内容区 -->
        <div class="main-content">
          <router-view />
        </div>

        <!-- 页脚 -->
        <GlobalFooter />
      </main>
    </div>

    <!-- 主题抽屉 -->
    <ThemeDrawer v-model="themeDrawerVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import GlobalSider from '@/layouts/modules/global-sider/index.vue'
import GlobalHeader from '@/layouts/modules/global-header/index.vue'
import GlobalBreadcrumb from '@/layouts/modules/global-breadcrumb/index.vue'
import GlobalTab from '@/layouts/modules/global-tab/index.vue'
import GlobalFooter from '@/layouts/modules/global-footer/index.vue'
import ThemeDrawer from '@/layouts/modules/theme-drawer/index.vue'
import CollapseButton from '@/layouts/modules/global-header/components/collapse-button.vue'
import Search from '@/layouts/modules/global-header/components/search.vue'
import Fullscreen from '@/layouts/modules/global-header/components/fullscreen.vue'
import ThemeButton from '@/layouts/modules/global-header/components/theme-button.vue'
import ThemeDrawerButton from '@/layouts/modules/global-header/components/theme-drawer-button.vue'
import Notice from '@/layouts/modules/global-header/components/notice.vue'
import UserCenter from '@/layouts/modules/global-header/components/user-center.vue'

const appStore = useAppStore()
const themeDrawerVisible = ref(false)

const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const layoutConfig = computed(() => appStore.layoutConfig)
const showSider = computed(() => appStore.showSider)

/**
 * 主容器样式（根据侧边栏状态调整左边距）
 */
const containerStyle = computed(() => {
  if (!appStore.showSider) {
    return { marginLeft: '0' }
  }
  
  const width = sidebarCollapsed.value
    ? layoutConfig.value.collapsedWidth
    : layoutConfig.value.sidebarWidth
  
  return {
    marginLeft: layoutConfig.value.fixedSidebar ? `${width}px` : '0',
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/mixins/responsive.scss';

.layout-default {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-page);
}

.layout-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  transition: margin-left var(--transition-normal) ease;

  /* 移动端不需要左边距，侧边栏使用抽屉模式 */
  @include respond-to-max('md') {
    margin-left: 0 !important;
  }
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-page);
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
  
  /* 移动端减少内边距 */
  @include respond-to-max('md') {
    padding: var(--spacing-4);
  }

  /* 平板端调整内边距 */
  @include respond-between('md', 'lg') {
    padding: var(--spacing-5);
  }
  
  /* 优化滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb);
    border-radius: var(--radius-full);
    
    &:hover {
      background-color: var(--scrollbar-thumb-hover);
    }
  }

  &::-webkit-scrollbar-track {
    background-color: var(--scrollbar-track);
  }

  /* 移动端隐藏滚动条 */
  @include respond-to-max('md') {
    &::-webkit-scrollbar {
      width: 4px;
    }
  }
}
</style>
