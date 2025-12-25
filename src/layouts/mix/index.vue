<template>
  <div class="layout-mix">
    <!-- 顶部头部（包含顶级菜单） -->
    <div class="layout-top-header">
      <div class="header-left">
        <GlobalLogo :collapsed="false" />
      </div>
      <div class="header-center">
        <GlobalMenu mode="horizontal" />
      </div>
      <div class="header-right">
        <Search />
        <Fullscreen />
        <ThemeButton />
        <ThemeDrawerButton @click="themeDrawerVisible = true" />
        <Notice />
        <UserCenter />
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="layout-body">
      <!-- 侧边栏（显示二级菜单） -->
      <GlobalSider
        :collapsed="sidebarCollapsed"
        :width="layoutConfig.sidebarWidth"
        :collapsed-width="layoutConfig.collapsedWidth"
        :fixed="false"
      />

      <!-- 主内容区 -->
      <div class="layout-container" :style="containerStyle">
        <!-- 次级头部 -->
        <div class="layout-sub-header">
          <div class="sub-header-left">
            <CollapseButton />
            <GlobalBreadcrumb v-if="layoutConfig.showBreadcrumb" />
          </div>
        </div>

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
    </div>

    <!-- 主题抽屉 -->
    <ThemeDrawer v-model="themeDrawerVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import GlobalLogo from '@/layouts/modules/global-logo/index.vue'
import GlobalSider from '@/layouts/modules/global-sider/index.vue'
import GlobalMenu from '@/layouts/modules/global-menu/index.vue'
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

/**
 * 主容器样式（根据侧边栏状态调整左边距）
 */
const containerStyle = computed(() => {
  const width = sidebarCollapsed.value
    ? layoutConfig.value.collapsedWidth
    : layoutConfig.value.sidebarWidth
  
  return {
    marginLeft: `${width}px`,
  }
})
</script>

<style scoped lang="scss">
.layout-mix {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-page);
}

.layout-top-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 var(--spacing-lg);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-base);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.header-left,
.header-center,
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header-left {
  flex-shrink: 0;
}

.header-center {
  flex: 1;
  justify-content: center;
}

.header-right {
  flex-shrink: 0;
}

.layout-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.layout-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  transition: margin-left var(--transition-normal) ease;
}

.layout-sub-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 var(--spacing-lg);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  transition: background-color var(--transition-normal);
}

.sub-header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
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
}
</style>
