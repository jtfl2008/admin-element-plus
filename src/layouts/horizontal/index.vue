<template>
  <div class="layout-horizontal">
    <!-- 主内容区 -->
    <div class="layout-container">
      <!-- 头部（包含水平菜单） -->
      <GlobalHeader :fixed="layoutConfig.fixedHeader">
        <template #left>
          <GlobalLogo />
        </template>
        <template #center>
          <GlobalMenu mode="horizontal" />
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

        <!-- 面包屑 -->
        <div v-if="layoutConfig.showBreadcrumb" class="main-breadcrumb">
          <GlobalBreadcrumb />
        </div>

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
import GlobalLogo from '@/layouts/modules/global-logo/index.vue'
import GlobalHeader from '@/layouts/modules/global-header/index.vue'
import GlobalMenu from '@/layouts/modules/global-menu/index.vue'
import GlobalBreadcrumb from '@/layouts/modules/global-breadcrumb/index.vue'
import GlobalTab from '@/layouts/modules/global-tab/index.vue'
import GlobalFooter from '@/layouts/modules/global-footer/index.vue'
import ThemeDrawer from '@/layouts/modules/theme-drawer/index.vue'
import Search from '@/layouts/modules/global-header/components/search.vue'
import Fullscreen from '@/layouts/modules/global-header/components/fullscreen.vue'
import ThemeButton from '@/layouts/modules/global-header/components/theme-button.vue'
import ThemeDrawerButton from '@/layouts/modules/global-header/components/theme-drawer-button.vue'
import Notice from '@/layouts/modules/global-header/components/notice.vue'
import UserCenter from '@/layouts/modules/global-header/components/user-center.vue'

const appStore = useAppStore()
const themeDrawerVisible = ref(false)

const layoutConfig = computed(() => appStore.layoutConfig)
</script>

<style scoped lang="scss">
.layout-horizontal {
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
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-page);
}

.main-breadcrumb {
  flex-shrink: 0;
  min-height: 40px;
  padding: 0.75rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
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
